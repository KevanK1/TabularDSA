const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const xlsx = require("xlsx");
const axios = require("axios");
const app = express();
// const con = require("./config/dbconfig");

// Models
const Teacher = require("./models/teacher");
const Subject = require("./models/subject");
const Room = require("./models/room");
const Division = require("./models/division");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage: storage });

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// Route for Page 1: Upload Excel Files
app.get("/", (req, res) => {
  res.render("index", { message: null });
});

app.post(
  "/upload",
  upload.fields([
    { name: "teachersFile", maxCount: 1 },
    { name: "subjectsFile", maxCount: 1 },
    { name: "roomsFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { teachersFile, subjectsFile, roomsFile } = req.files;

      const teachersWorkbook = xlsx.readFile(teachersFile[0].path);
      const teachersSheet = xlsx.utils.sheet_to_json(
        teachersWorkbook.Sheets[teachersWorkbook.SheetNames[0]]
      );
      const teachersData = teachersSheet.map((row) => ({
        mis_id: row.mis_id,
        name: row.name,
        email: row.email,
      }));
      await Teacher.deleteMany();
      await Teacher.insertMany(teachersData);

      const subjectsWorkbook = xlsx.readFile(subjectsFile[0].path);
      const subjectsSheet = xlsx.utils.sheet_to_json(
        subjectsWorkbook.Sheets[subjectsWorkbook.SheetNames[0]]
      );
      const subjectsData = subjectsSheet.map((row) => ({
        code: row.code,
        name: row.name,
      }));
      await Subject.deleteMany();
      await Subject.insertMany(subjectsData);

      const roomsWorkbook = xlsx.readFile(roomsFile[0].path);
      const roomsSheet = xlsx.utils.sheet_to_json(
        roomsWorkbook.Sheets[roomsWorkbook.SheetNames[0]]
      );
      const roomsData = roomsSheet.map((row) => ({
        room_id: row.room_id,
        name: row.name,
        capacity: row.capacity,
      }));
      await Room.deleteMany();
      await Room.insertMany(roomsData);

      await Division.deleteMany();
      await Division.insertMany([
        { name: "Division A" },
        { name: "Division B" },
        { name: "Division C" },
        { name: "Division D" },
        { name: "Division E" },
      ]);

      fs.unlinkSync(teachersFile[0].path);
      fs.unlinkSync(subjectsFile[0].path);
      fs.unlinkSync(roomsFile[0].path);

      res.redirect("/assign-teachers");
    } catch (err) {
      console.error("Upload error:", err);
      res.render("index", { message: "Error uploading files." });
    }
  }
);

// Route for Page 2: Assign Teachers
app.get("/assign-teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find({}, "name mis_id email");
    const subjects = await Subject.find(
      {},
      "name code assignedTeachers"
    ).populate("assignedTeachers");
    res.render("assign-teachers", { teachers, subjects });
  } catch (err) {
    console.error("Error loading assign-teachers:", err);
    res.status(500).send("Error loading assign-teachers page.");
  }
});

// Route to Handle Teacher-Subject Assignment and Timetable Generation
app.post("/assign", async (req, res) => {
  try {
    const assignments = req.body.assignments;
    console.log("Assignments received:", assignments);

    for (const subjectId in assignments) {
      const teacherIds = assignments[subjectId];
      const teachersArray = Array.isArray(teacherIds)
        ? teacherIds
        : teacherIds
        ? [teacherIds]
        : [];
      await Subject.findByIdAndUpdate(
        subjectId,
        { assignedTeachers: teachersArray },
        { new: true, runValidators: true }
      );
    }

    console.log("Redirecting to /get-timetable after assign");
    res.redirect("/get-timetable");
  } catch (err) {
    console.error("Assign error:", err);
    res.status(500).send("Error assigning teachers to subjects.");
  }
});

// Route for Fetching Timetable from FastAPI
app.get("/get-timetable", async (req, res) => {
  try {
    const teachers = await Teacher.find({}, "name email");
    const subjects = await Subject.find(
      {},
      "name code assignedTeachers"
    ).populate("assignedTeachers");
    const rooms = await Room.find({}, "name capacity");
    const divisions = await Division.find({}, "name");

    const timetableData = {
      teachers: teachers.map((t) => ({
        id: t._id.toString(),
        name: t.name,
        email: t.email,
      })),
      subjects: subjects.map((s) => ({
        id: s._id.toString(),
        code: s.code,
        name: s.name,
        assignedTeachers: s.assignedTeachers.map((t) => t._id.toString()),
      })),
      rooms: rooms.map((r) => ({
        id: r._id.toString(),
        name: r.name,
        capacity: r.capacity,
      })),
      divisions: divisions.map((d) => ({ id: d._id.toString(), name: d.name })),
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/generate-timetable",
        timetableData
      );
      const timetables = response.data;
      res.render("display-timetable", { timetables });
    } catch (apiError) {
      console.error("FastAPI Error:", apiError.message);
      res.render("display-timetable", {
        timetables: [],
        error: "Failed to generate timetable. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error preparing timetable data:", error.message);
    res.status(500).send(`Failed to prepare timetable data: ${error.message}`);
  }
});

// Route for Generating Timetable from FastAPI
app.post("/get-timetable", async (req, res) => {
  try {
    const teachers = await Teacher.find({}, "name email");
    const subjects = await Subject.find(
      {},
      "name code assignedTeachers"
    ).populate("assignedTeachers");
    const rooms = await Room.find({}, "name capacity");
    const divisions = await Division.find({}, "name");

    const timetableData = {
      teachers: teachers.map((t) => ({
        id: t._id.toString(),
        name: t.name,
        email: t.email,
      })),
      subjects: subjects.map((s) => ({
        id: s._id.toString(),
        code: s.code,
        name: s.name,
        assignedTeachers: s.assignedTeachers.map((t) => t._id.toString()),
      })),
      rooms: rooms.map((r) => ({
        id: r._id.toString(),
        name: r.name,
        capacity: r.capacity,
      })),
      divisions: divisions.map((d) => ({ id: d._id.toString(), name: d.name })),
    };

    console.log("\nData being sent to FastAPI:");
    console.log("Teachers:", JSON.stringify(timetableData.teachers, null, 2));
    console.log("Subjects:", JSON.stringify(timetableData.subjects, null, 2));
    console.log("Rooms:", JSON.stringify(timetableData.rooms, null, 2));
    console.log("Divisions:", JSON.stringify(timetableData.divisions, null, 2));

    console.log("Sending to FastAPI:", JSON.stringify(timetableData, null, 2));
    const response = await axios.post(
      "http://127.0.0.1:8000/generate-timetable",
      timetableData
    );
    const timetables = response.data;

    console.log("FastAPI Response:", timetables);
    res.render("display-timetable", { timetables });
  } catch (error) {
    console.error("Error generating timetable:", error.message);
    res.status(500).send(`Failed to generate timetable: ${error.message}`);
  }
});

// Fallback for misrouted requests
app.post("/generate-timetable", (req, res) => {
  res
    .status(404)
    .send(
      "Route not found. Did you mean to call the FastAPI endpoint at http://127.0.0.1:8000/generate-timetable?"
    );
});

// Start Server with MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/timetableDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () =>
      console.log("Server running on http://localhost:3000")
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));

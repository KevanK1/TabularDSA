const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const xlsx = require("xlsx");
const conn = require("./config/dbconfig");
const app = express();

// 📄 Models
const Teacher = require("./models/teacher");
const Subject = require("./models/subject");
const Room = require("./models/room");
const FixedSlot = require("./models/fixed_slots");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 📂 Multer upload setup
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 📄 GET: Upload Page
app.get("/", (req, res) => {
  res.render("index", { message: null });
});

// 📄 POST: Upload & Save Data
app.post(
  "/upload",
  upload.fields([
    { name: "teachersFile", maxCount: 1 },
    { name: "subjectsFile", maxCount: 1 },
    { name: "roomsFile", maxCount: 1 },
    { name: "fixedSlotsFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { teachersFile, subjectsFile, roomsFile, fixedSlotsFile } = req.files;

      // 🔷 Clear old data
      await Promise.all([
        Teacher.deleteMany(),
        Subject.deleteMany(),
        Room.deleteMany(),
        FixedSlot.deleteMany()
      ]);

      // 🔷 Teachers
      const teachersData = xlsx.utils.sheet_to_json(
        xlsx.readFile(teachersFile[0].path).Sheets["Sheet1"]
      ).map(row => ({
        mis_id: row.mis_id,
        name: row.name,
        email: row.email,
        designation: row.designation,
        subject_preferences: row.subject_preferences.split(",").map(s => s.trim()),
      }));
      await Teacher.insertMany(teachersData);

      // 🔷 Subjects
      const subjectsData = xlsx.utils.sheet_to_json(
        xlsx.readFile(subjectsFile[0].path).Sheets["Sheet1"]
      ).map(row => {
        const [theory, lab] = row.weekly_load.split(",").map(Number);
        return {
          code: row.code,
          name: row.name,
          department: row.department,
          semester: row.semester,
          weekly: { raw: row.weekly_load, theory, lab },
        };
      });
      await Subject.insertMany(subjectsData);

      // 🔷 Rooms
      const roomsData = xlsx.utils.sheet_to_json(
        xlsx.readFile(roomsFile[0].path).Sheets["Sheet1"]
      ).map(row => ({
        room_no: row.room_no,
        capacity: row.capacity,
        room_type: row.room_type,
        equipment: row.equipment ? row.equipment.split(",").map(e => e.trim()) : [],
      }));
      await Room.insertMany(roomsData);

      // 🔷 Fixed Slots
      const fixedSlotsSheet = xlsx.utils.sheet_to_json(
        xlsx.readFile(fixedSlotsFile[0].path).Sheets["Sheet1"]
      );

      const fixedSlotsByDivision = {};

      for (const row of fixedSlotsSheet) {
        if (!fixedSlotsByDivision[row.division]) {
          fixedSlotsByDivision[row.division] = [];
        }
        const subjectDoc = await Subject.findOne({ code: row.subject });
        if (!subjectDoc) throw new Error(`Subject ${row.subject} not found`);

        fixedSlotsByDivision[row.division].push({
          day: row.day,
          period: row.period,
          teacher: row.teacher,
          room: row.room,
          subject: subjectDoc._id,
        });
      }

      const fixedSlotDocs = Object.entries(fixedSlotsByDivision).map(
        ([division, fixed_slots]) => ({ division, fixed_slots })
      );

      await FixedSlot.insertMany(fixedSlotDocs);

      // 🔷 Clean up files
      fs.unlinkSync(teachersFile[0].path);
      fs.unlinkSync(subjectsFile[0].path);
      fs.unlinkSync(roomsFile[0].path);
      fs.unlinkSync(fixedSlotsFile[0].path);

      console.log(`✅ Uploaded: ${teachersData.length} teachers, ${subjectsData.length} subjects, ${roomsData.length} rooms, ${fixedSlotDocs.length} fixed slots`);
      res.redirect("/assign-teachers");
    } catch (err) {
      console.error("❌ Upload error:", err.message);
      res.render("index", {
        message: `Error uploading files: ${err.message}. Check your Excel file formats.`,
      });
    }
  }
);

app.listen(3000, () => {
  console.log("🌐 Server running at http://localhost:3000");
});

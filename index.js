const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const xlsx = require('xlsx');
const axios = require('axios'); // For calling FastAPI
const app = express();
const con = require("./config/dbconfig")
// MongoDB Connection

// Models
const Teacher = require('./models/teacher');
const Subject = require('./models/subject');
const Room = require('./models/room');
const Division = require('./models/division');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Route for Page 1: Upload Excel Files
app.get('/', (req, res) => {
    res.render('index', { message: null });
});

app.post('/upload', upload.fields([
    { name: 'teachersFile', maxCount: 1 },
    { name: 'subjectsFile', maxCount: 1 },
    { name: 'roomsFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const { teachersFile, subjectsFile, roomsFile } = req.files;

        // Parse Teachers Excel
        const teachersWorkbook = xlsx.readFile(teachersFile[0].path);
        const teachersSheet = xlsx.utils.sheet_to_json(teachersWorkbook.Sheets[teachersWorkbook.SheetNames[0]]);
        const teachersData = teachersSheet.map(row => ({
            mis_id: row.mis_id,
            name: row.name,
            email: row.email
        }));
        await Teacher.deleteMany({}); // Clear previous data
        await Teacher.insertMany(teachersData);

        // Parse Subjects Excel
        const subjectsWorkbook = xlsx.readFile(subjectsFile[0].path);
        const subjectsSheet = xlsx.utils.sheet_to_json(subjectsWorkbook.Sheets[subjectsWorkbook.SheetNames[0]]);
        const subjectsData = subjectsSheet.map(row => ({
            code: row.code,
            name: row.name
        }));
        await Subject.deleteMany({});
        await Subject.insertMany(subjectsData);

        // Parse Rooms Excel
        const roomsWorkbook = xlsx.readFile(roomsFile[0].path);
        const roomsSheet = xlsx.utils.sheet_to_json(roomsWorkbook.Sheets[roomsWorkbook.SheetNames[0]]);
        const roomsData = roomsSheet.map(row => ({
            room_id: row.room_id,
            name: row.name,
            capacity: row.capacity
        }));
        await Room.deleteMany({});
        await Room.insertMany(roomsData);

        // Clean up uploaded files
        fs.unlinkSync(teachersFile[0].path);
        fs.unlinkSync(subjectsFile[0].path);
        fs.unlinkSync(roomsFile[0].path);

        // Redirect to Page 2
        res.redirect('/assign-teachers');
    } catch (err) {
        console.error(err);
        res.render('index', { message: 'Error uploading files.' });
    }
});

// Placeholder routes for future pages
app.get('/assign-teachers', (req, res) => {
    res.send('Page 2: Assign Teachers (To be implemented)');
});

app.get('/adjust-labs', (req, res) => {
    res.send('Page 3: Adjust Labs (To be implemented)');
});

app.get("/get-timetable", async (req, res) => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/"); // FastAPI endpoint
    res.json(response.data); // Send response back to client
  } catch (error) {
    console.error("Error fetching data from FastAPI:", error.message);
    res.status(500).json({ error: "Failed to fetch data from FastAPI" });
  }
});

app.listen(3000, () => console.log('http://localhost:3000'));
// const express = require("express");
// const axios = require("axios");
// const connection = require("./config/dbconfig")

// const app = express();
// const PORT = 3000; // Your Express server port
// connection

// // Route to fetch timetable from FastAPI

// // Start Express Server
// app.listen(PORT, () => {
//   console.log(`Express server running on http://127.0.0.1:${PORT}`);
// });

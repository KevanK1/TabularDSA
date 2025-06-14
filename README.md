# 📊 Tabular — Automatic Timetable Generator

**Generate conflict-free academic timetables in seconds using DSA and Python.**

A hybrid Node.js + FastAPI project that builds intelligent, balanced weekly timetables for multiple divisions, teachers, and rooms — using algorithmic logic instead of rigid rules.

---

## 🚀 Overview

**Tabular** was built to solve a surprisingly difficult problem: **generating fair, clash-free timetables** for schools and colleges, where subjects, teachers, classrooms, and time slots all overlap.

Instead of relying on manual drag-and-drop tools, Tabular uses pure **DSA logic** (implemented in Python via FastAPI) to compute optimized schedules, avoiding conflicts and overbooking in real-time.

---

## ✨ Features

- 📅 **Generates 10 full 6-day timetables** (or as needed)
- 👨‍🏫 **Multiple teachers per subject** supported
- 🏫 **Limited classrooms** handled intelligently
- ⚖️ **Conflict prevention**: no teacher or room clashes
- 🧠 **DSA-based logic**: no hardcoded rules, only clean logic
- 📦 **FastAPI microservice** for timetable computation
- 🌐 **Node.js + Express + EJS** for frontend/backend interface
- 📤 **Excel file upload** for input (teachers, subjects, rooms)

---

## 🧠 How It Works

1. **Input**:
   *** Upload the xlsx files for room, teacher and subjects***
   - Number of classes/divisions
   - Subjects per class
   - Teachers available for each subject
   - Total rooms
   - Days and periods per day

3. **Processing**:
   - FastAPI service uses algorithms to allocate subjects across days and periods
   - Ensures no teacher or room is double-booked
   - Rotates teachers where multiple are available

4. **Output**:
   - JSON timetable for each class
   - Rendered in a clean EJS view on the frontend
   - Download option as `.xlsx` (coming soon)

---

## 📂 Project Structure
Tabular/ ├── backend/              
# Node.js + Express + EJS │   
├── routes/ │   
├── views/ │  
└── public/ 
├── fastapi-service/    
# Python FastAPI microservice │
└── timetable_api.py 
├── README.md 
└── .env

---

## ⚙️ Tech Stack

| Layer       | Tech Used                         |
|-------------|-----------------------------------|
| Frontend    | EJS, Tailwind (basic), HTML/CSS   |
| Backend     | Node.js + Express.js              |
| DSA Engine  | FastAPI + Python (DSA logic)      |
| File Input  | Excel (.xlsx), or JSON            |
| Data Flow   | REST API (JSON only)              |

---

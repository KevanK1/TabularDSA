const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  division: { type: String, required: true }, // e.g., CSE-A
  semester: { type: Number, required: true }, // e.g., 5
  academic_year: { type: String, required: true }, // e.g., 2024-2025
  generated_at: { type: Date, default: Date.now }, // timestamp

  timetable: {
    type: Object,
    default: {
      Monday: {},
      Tuesday: {},
      Wednesday: {},
      Thursday: {},
      Friday: {},
      Saturday: {},
    },
  },
});

module.exports = mongoose.model("Timetable", timetableSchema);

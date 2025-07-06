const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },

  weekly: {
    raw: { type: String, required: true }, // e.g., "3,1"
    theory: { type: Number, default: 0 }, // parsed: 3
    lab: { type: Number, default: 0 }, // parsed: 1
  },

  assignedTeachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
});

// Automatically parse weekly.raw into weekly.theory and weekly.lab
subjectSchema.pre("save", function (next) {
  if (this.weekly && this.weekly.raw) {
    const [theory, lab] = this.weekly.raw.split(",").map(Number);
    this.weekly.theory = theory || 0;
    this.weekly.lab = lab || 0;
  }
  next();
});

module.exports = mongoose.model("Subject", subjectSchema);

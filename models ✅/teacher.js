const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  mis_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },

  designation: { type: String, required: true }, // e.g., HOD, Subject Head, Professor, Assistant Professor

  subject_preferences: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  ],

  slots_assigned: [
    {
      semester: Number,
      department: String,
      division: String,
      subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
      room: String,
      day: Number,
      period: Number,
    },
  ],
});

// helper method to get max load based on designation
teacherSchema.methods.getMaxLoad = function () {
  switch (this.designation) {
    case "HOD":
      return 4;
    case "Subject Head":
      return 6;
    case "Professor":
      return 8;
    case "Assistant Professor":
      return 10;
    default:
      return 8; // fallback
  }
};

module.exports = mongoose.model("Teacher", teacherSchema);

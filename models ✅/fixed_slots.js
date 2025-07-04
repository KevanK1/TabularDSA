const mongoose = require("mongoose");

const fixedSlotSchema = new mongoose.Schema({
  division: { type: String, required: true }, // e.g., CSE-A

  fixed_slots: [
    {
      day: { type: Number, required: true }, // e.g., 1 (Monday)
      period: { type: Number, required: true }, // e.g., 2
      teacher: { type: String, required: true }, // Teacher ID or Name
      room: { type: String, required: true }, // Room number
    },
  ],
});

module.exports = mongoose.model("FixedSlot", fixedSlotSchema);

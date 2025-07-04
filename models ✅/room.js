const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  room_no: { type: String, required: true, unique: true }, // e.g., N-303
  capacity: { type: Number, required: true }, // e.g., 60

  weekly_schedule: {
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

module.exports = mongoose.model("Room", roomSchema);

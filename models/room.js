const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    room_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    capacity: { type: Number, required: true }
});

module.exports = mongoose.model('Room', roomSchema);
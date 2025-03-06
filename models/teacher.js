const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    mis_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true }
});

module.exports = mongoose.model('Teacher', teacherSchema);
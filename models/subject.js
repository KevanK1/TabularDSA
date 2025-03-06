const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }]
});

module.exports = mongoose.model('Subject', subjectSchema);
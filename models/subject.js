const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    assignedTeachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: [] }]
});

module.exports = mongoose.model('Subject', subjectSchema);
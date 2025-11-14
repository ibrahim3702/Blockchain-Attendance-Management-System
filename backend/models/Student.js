// backend/models/Student.js
const mongoose = require('mongoose');
const BlockSchema = require('./BlockSchema');

const StudentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    rollNo: { type: String, required: true },
    status: { type: String, default: 'active' },
    parentClassId: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    chain: { type: [BlockSchema], required: true },
});

module.exports = mongoose.models.Student || mongoose.model('Student', StudentSchema);
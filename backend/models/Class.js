
const mongoose = require('mongoose');
const BlockSchema = require('./BlockSchema');

const ClassSchema = new mongoose.Schema({
    classId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    status: { type: String, default: 'active' },
    parentDeptId: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    chain: { type: [BlockSchema], required: true },
});

module.exports = mongoose.models.Class || mongoose.model('Class', ClassSchema);
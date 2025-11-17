
const mongoose = require('mongoose');
const BlockSchema = require('./BlockSchema');

const DepartmentSchema = new mongoose.Schema({
    // This will be the main ID
    deptId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    status: { type: String, default: 'active' }, // 'active' or 'deleted'
    createdAt: { type: Date, default: Date.now },
    chain: { type: [BlockSchema], required: true },
});

module.exports = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
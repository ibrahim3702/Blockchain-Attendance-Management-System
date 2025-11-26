require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const deptsRoutes = require('./routes/depts');
const classesRoutes = require('./routes/classes');
const studentsRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const statsRoutes = require('./routes/stats');
const validationService = require('./services/validationService');
const repairService = require('./services/repairService');
const hierarchyRoutes = require('./routes/hierarchy');
const connectDB = require('./utils/db');
const app = express();
app.use(cors());
app.use(bodyParser.json());
connectDB();
app.use('/api/departments', deptsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/hierarchy', hierarchyRoutes);
// Validation endpoint
app.get('/api/validate-all', async (req, res) => {
    try {
        const report = await validationService.validateAllChains();
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Repair endpoints
app.post('/api/repair/all', async (req, res) => {
    try {
        const results = await repairService.repairAllChains();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/repair/department/:deptId', async (req, res) => {
    try {
        const result = await repairService.repairDepartmentChain(req.params.deptId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/', (req, res) => {
    res.send('BAMS Backend is running.');
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`BAMS backend listening on ${PORT}`));
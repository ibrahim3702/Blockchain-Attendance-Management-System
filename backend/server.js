const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const deptsRoutes = require('./routes/depts');
const classesRoutes = require('./routes/classes');
const studentsRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const validationService = require('./services/validationService');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/departments', deptsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/attendance', attendanceRoutes);

// Validation endpoint
app.get('/api/validate-all', async (req, res) => {
    try {
        const report = await validationService.validateAllChains();
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`BAMS backend listening on ${PORT}`));
module.exports = serverless(app);
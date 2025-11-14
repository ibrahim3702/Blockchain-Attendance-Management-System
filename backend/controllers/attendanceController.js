const chainService = require('../services/chainService');

exports.markAttendance = async (req, res) => {
    try {
        const { studentId, status, notes } = req.body;
        if (!studentId || !status) {
            return res.status(400).json({ error: 'studentId and status are required' });
        }

        const attData = { status, notes, markedAt: new Date().toISOString() };
        const block = await chainService.markAttendance(studentId, attData);

        res.status(201).json(block);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Note: Getting attendance for a student is handled by studentController.getStudentChain
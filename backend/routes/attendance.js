const express = require('express');
const router = express.Router();
const controller = require('../controllers/attendanceController');

// Mark attendance
router.post('/', controller.markAttendance);

module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentController');

router.post('/', controller.createStudent);
router.get('/', controller.getAllStudents);
router.get('/search', controller.findStudent); // e.g., /api/students/search?q=Alice
router.put('/:id', controller.updateStudent);
router.delete('/:id', controller.deleteStudent);
router.get('/:chainId/chain', controller.getStudentChain);

module.exports = router;
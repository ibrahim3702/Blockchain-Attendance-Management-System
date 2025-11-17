const chainService = require('../services/chainService');

exports.createStudent = async (req, res) => {
    try {
        const { parentClassId, ...studentMeta } = req.body;
        if (!parentClassId) return res.status(400).json({ error: 'parentClassId is required' });

        const stu = await chainService.createStudent(studentMeta, parentClassId);
        res.status(201).json(stu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const stu = await chainService.updateStudent(req.params.id, req.body);
        res.status(200).json(stu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const result = await chainService.deleteStudent(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        const students = await chainService.listStudents(req.query.classId);
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStudentChain = async (req, res) => {
    try {
        const chain = await chainService.getChain(req.params.chainId);
        res.status(200).json(chain);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.findStudent = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Search query "q" is required' });
        const students = await chainService.findStudent(q);
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const chainService = require('../services/chainService');

exports.createDept = async (req, res) => {
    try {
        const dept = await chainService.createDepartment(req.body);
        res.status(201).json(dept);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateDept = async (req, res) => {
    try {
        const dept = await chainService.updateDepartment(req.params.id, req.body);
        res.status(200).json(dept);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteDept = async (req, res) => {
    try {
        const result = await chainService.deleteDepartment(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllDepts = async (req, res) => {
    try {
        const depts = await chainService.listDepartments();
        res.status(200).json(depts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDeptChain = async (req, res) => {
    try {
        const chain = await chainService.getChain(req.params.chainId);
        res.status(200).json(chain);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const chainService = require('../services/chainService');

exports.createClass = async (req, res) => {
    try {

        const { parentDeptId, ...classMeta } = req.body;
        if (!parentDeptId) return res.status(400).json({ error: 'parentDeptId is required' });

        const cls = await chainService.createClass(classMeta, parentDeptId);
        res.status(201).json(cls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateClass = async (req, res) => {
    try {
        const cls = await chainService.updateClass(req.params.id, req.body);
        res.status(200).json(cls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteClass = async (req, res) => {
    try {
        const result = await chainService.deleteClass(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllClasses = async (req, res) => {
    try {

        const classes = await chainService.listClasses(req.query.deptId);
        res.status(200).json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getClassChain = async (req, res) => {
    try {
        const chain = await chainService.getChain(req.params.chainId);
        res.status(200).json(chain);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
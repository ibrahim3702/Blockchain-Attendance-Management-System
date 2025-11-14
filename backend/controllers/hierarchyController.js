const hierarchyService = require('../services/hierarchyService');

exports.getTree = async (req, res) => {
    try {
        const tree = await hierarchyService.getFullHierarchy();
        res.status(200).json(tree);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
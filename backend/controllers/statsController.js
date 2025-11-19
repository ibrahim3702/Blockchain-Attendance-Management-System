const chainService = require('../services/chainService');

exports.getStats = async (req, res) => {
    try {
        const stats = await chainService.getSystemStats();
        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const express = require('express');
const router = express.Router();
const controller = require('../controllers/hierarchyController');

router.get('/tree', controller.getTree);

module.exports = router;
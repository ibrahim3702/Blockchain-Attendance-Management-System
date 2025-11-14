const express = require('express');
const router = express.Router();
const controller = require('../controllers/classController');

router.post('/', controller.createClass);
router.get('/', controller.getAllClasses);
router.put('/:id', controller.updateClass);
router.delete('/:id', controller.deleteClass);
router.get('/:chainId/chain', controller.getClassChain);

module.exports = router;
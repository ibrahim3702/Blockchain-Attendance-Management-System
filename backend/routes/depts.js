const express = require('express');
const router = express.Router();
const controller = require('../controllers/deptController');


router.post('/', controller.createDept);
router.get('/', controller.getAllDepts);
router.put('/:id', controller.updateDept);
router.delete('/:id', controller.deleteDept);
router.get('/:chainId/chain', controller.getDeptChain);

module.exports = router;
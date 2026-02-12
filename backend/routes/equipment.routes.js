const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');

// Users -> View Equipment
router.get('/', verifyToken, equipmentController.getAllEquipment);

// Admin -> Add/Update/Delete Equipment
router.post('/', verifyToken, authorizeRole('admin'), equipmentController.createEquipment);
router.put('/:id', verifyToken, authorizeRole('admin'), equipmentController.updateEquipment);
router.delete('/:id', verifyToken, authorizeRole('admin'), equipmentController.deleteEquipment);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');

// Admin -> Manage Users
router.get('/', verifyToken, authorizeRole('admin'), userController.getAllUsers);
router.post('/', verifyToken, authorizeRole('admin'), userController.createUser);
router.delete('/:id', verifyToken, authorizeRole('admin'), userController.deleteUser);

module.exports = router;

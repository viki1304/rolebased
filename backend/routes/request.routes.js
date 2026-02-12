const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');

// User -> Request Equipment
router.post('/', verifyToken, authorizeRole('user'), requestController.createRequest);

// Admin/User -> View Requests (Admin sees all, User sees own)
router.get('/', verifyToken, requestController.getRequests);

// Admin -> Update Request Status
router.put('/:id/status', verifyToken, authorizeRole('admin'), requestController.updateRequestStatus);

// User -> Update Request Details (e.g. Quantity)
router.put('/:id', verifyToken, requestController.updateRequestDetails);

// User -> Cancel Request
router.delete('/:id', verifyToken, requestController.deleteRequest);

module.exports = router;

const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// GET /api/staff/stats
router.get('/stats', staffController.getStaffStats);

// GET /api/staff/complaints
router.get('/complaints', staffController.getStaffComplaints);

// PATCH /api/staff/complaints/:id/status
router.patch('/complaints/:id/status', staffController.updateStatus);

module.exports = router;

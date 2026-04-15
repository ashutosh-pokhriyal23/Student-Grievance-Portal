const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Protect all staff routes — require valid JWT and teacher or admin role
router.use(authMiddleware);
router.use(requireRole(['teacher', 'admin']));

// GET /api/staff/profile
router.get('/profile', staffController.getStaffProfile);

// GET /api/staff/maintainers
router.get('/maintainers', staffController.getMaintainers);

// PATCH /api/staff/complaints/:id/assign
router.patch('/complaints/:id/assign', staffController.assignMaintainer);

// GET /api/staff/stats
router.get('/stats', staffController.getStaffStats);

// GET /api/staff/complaints
router.get('/complaints', staffController.getStaffComplaints);

// PATCH /api/staff/complaints/:id/status
router.patch('/complaints/:id/status', staffController.updateStatus);

module.exports = router;


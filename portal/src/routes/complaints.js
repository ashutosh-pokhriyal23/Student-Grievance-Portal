const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const complaintsController = require('../controllers/complaintsController');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// GET /api/complaints — Public: anyone can browse complaints
router.get('/', complaintsController.getComplaintsBySpace);

// GET /api/complaints/:id — Public: anyone can view complaint detail
router.get('/:id', complaintsController.getComplaintById);

// POST /api/complaints — Protected: students only
router.post(
  '/',
  authMiddleware,
  requireRole(['student']),
  validate([
    body('space_id').isUUID().withMessage('Valid Space ID is required'),
    body('title').notEmpty().withMessage('Title is required').trim(),
    body('description').notEmpty().withMessage('Description is required').trim(),
    body('category').isIn([
      'infrastructure',
      'water',
      'electricity',
      'academic',
      'mess',
      'other',
      'Infrastructure',
      'Water',
      'Electricity',
      'Academic',
      'Mess',
      'Other',
    ]).withMessage('Invalid category'),
    body('is_anonymous').isBoolean(),
  ]),
  complaintsController.createComplaint
);

// PATCH /api/complaints/:id/upvote — Protected: students only
router.patch('/:id/upvote', authMiddleware, requireRole(['student']), complaintsController.upvoteComplaint);

module.exports = router;


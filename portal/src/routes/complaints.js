const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const complaintsController = require('../controllers/complaintsController');
const validate = require('../middleware/validate');

// GET /api/complaints
router.get('/', complaintsController.getComplaintsBySpace);

// GET /api/complaints/:id
router.get('/:id', complaintsController.getComplaintById);

// POST /api/complaints
router.post(
  '/',
  validate([
    body('space_id').isUUID().withMessage('Valid Space ID is required'),
    body('title').notEmpty().withMessage('Title is required').trim(),
    body('description').notEmpty().withMessage('Description is required').trim(),
    body('category').isIn(['infrastructure', 'water', 'electricity', 'academic', 'mess', 'other']).withMessage('Invalid category'),
    body('is_anonymous').isBoolean(),
  ]),
  complaintsController.createComplaint
);

// PATCH /api/complaints/:id/upvote
router.patch('/:id/upvote', complaintsController.upvoteComplaint);

module.exports = router;

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/teachers', adminController.getTeachers);
router.get('/space-heads/:space_id', adminController.getActiveSpaceHeads);
router.post('/space-heads', adminController.assignSpaceHead);
router.patch('/space-heads/:id/remove', adminController.removeSpaceHead);
router.delete('/space-heads/:id', adminController.deleteSpaceHeadForever);
router.post('/space-heads/save', adminController.saveSpaceHeads);

router.get('/overview', adminController.getOverview);
router.get('/trends', adminController.getTrends);
router.get('/performance', adminController.getPerformance);
router.get('/escalations', adminController.getEscalations);
router.get('/categories', adminController.getCategories);

module.exports = router;

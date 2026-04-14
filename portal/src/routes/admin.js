const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/overview', adminController.getOverview);
router.get('/trends', adminController.getTrends);
router.get('/performance', adminController.getPerformance);
router.get('/escalations', adminController.getEscalations);
router.get('/categories', adminController.getCategories);

module.exports = router;

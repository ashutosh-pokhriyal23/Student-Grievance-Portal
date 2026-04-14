const express = require('express');
const router = express.Router();
const spacesController = require('../controllers/spacesController');

router.get('/', spacesController.getAllSpaces);

module.exports = router;

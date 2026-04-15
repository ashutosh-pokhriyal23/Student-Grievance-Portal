const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define specific paths mapped to authController
router.post('/register', upload.single('idCard'), authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.get('/verify', authMiddleware, authController.getProfile);

module.exports = router;

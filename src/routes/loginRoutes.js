const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Solo '/' porque el prefijo '/api/login' ya se puso en index.js
router.post('/', loginController.login);

module.exports = router;
const express = require('express');
const router = express.Router();
const rateLimitMiddleware = require('../middleware/rateLimiter');
const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup);
router.post('/login', rateLimitMiddleware, userCtrl.login);


module.exports = router;
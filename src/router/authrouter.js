const express = require('express');
const router = express.Router();
const db = require('../config/db')
const bcrypt = require('bcryptjs');
const authcontroller = require('../controller/authcontroller');
const verifyToken = require('../middleware/auth-middleware');
const jwt = require('jsonwebtoken');

router.get('/login', authcontroller.getLogin);
router.post('/login-user',authcontroller.postLogin);
router.get('/logout', authcontroller.getLogout);
router.post('/register-user', authcontroller.postRegister);
router.get('/dashboard', verifyToken, authcontroller.getdashboard)
router.get('/register', authcontroller.getRegister);


module.exports = router;
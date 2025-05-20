const express = require('express');
const router = express.Router();
const db = require('../config/db')
const bcrypt = require('bcryptjs');
const productcontroller = require('../controller/productcontroller');
const cartcontroller = require('../controller/cartcontroller');
const verifyToken = require('../middleware/auth-middleware');
const jwt = require('jsonwebtoken');

router.post('/add', verifyToken, cartcontroller.postaddcart);
router.get('/', verifyToken, cartcontroller.getcartitems);  
router.post('/order', verifyToken, cartcontroller.getodercartitems);
router.get('/order-success', cartcontroller.getodersucess);
  
module.exports = router;
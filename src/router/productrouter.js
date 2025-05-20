const express = require('express');
const router = express.Router();
const db = require('../config/db')
const bcrypt = require('bcryptjs');
const productcontroller = require('../controller/productcontroller');
const verifyToken = require('../middleware/auth-middleware');
const jwt = require('jsonwebtoken');

router.get('/search-view', productcontroller.renderSearchPage);
router.get('/search', productcontroller.searchProducts);
router.get('/:categoryId', productcontroller.getProductsByCategoryId);
router.get('/detail/:productId',productcontroller.getProductDetailbyProductId); 
router.get('/product/:productId', productcontroller.getProductDetailPage);

module.exports = router;
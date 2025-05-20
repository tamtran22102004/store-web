const express = require('express');
const router = express.Router();
const db = require('../config/db')
const bcrypt = require('bcryptjs');
const productcontroller = require('../controller/productcontroller');
const cartcontroller = require('../controller/cartcontroller');
const verifyToken = require('../middleware/auth-middleware');
const jwt = require('jsonwebtoken');
const ordercontroller = require('../controller/ordercontroller');
// router.post('/orders', async (req, res) => {
//     const { userId, address, cart } = req.body;
  
//     const conn = await db.getConnection();
//     await conn.beginTransaction();
  
//     try {
//       // 1. Lưu địa chỉ
//       const [addressResult] = await conn.query(
//         'INSERT INTO addresses (user_id, province, district, commune, street_address, housing_type) VALUES (?, ?, ?, ?, ?, ?)',
//         [userId, address.province, address.district, address.commune, address.street_address, address.housing_type]
//       );
//       const addressId = addressResult.insertId;
  
//       // 2. Tính tổng tiền
//       const totalPrice = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  
//       // 3. Tạo đơn hàng
//       const [orderResult] = await conn.query(
//         'INSERT INTO orders (user_id, address_id, total_price, status) VALUES (?, ?, ?, ?)',
//         [userId, addressId, totalPrice, 'pending']
//       );
//       const orderId = orderResult.insertId;
  
//       // 4. Lưu từng sản phẩm vào order_items
//       for (const item of cart) {
//         await conn.query(
//           'INSERT INTO order_items (order_id, product_variant_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
//           [orderId, item.product_variant_id, item.quantity, item.unit_price]
//         );
//       }
  
//       await conn.commit();
//       res.status(201).json({ message: 'Đặt hàng thành công', orderId });
  
//     } catch (error) {
//       await conn.rollback();
//       console.error(error);
//       res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' });
//     } finally {
//       conn.release();
//     }
//   });

router.get('/', verifyToken, ordercontroller.getpageorder);
  

module.exports = router;
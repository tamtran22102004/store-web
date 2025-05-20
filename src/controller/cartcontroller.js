const express = require('express');
const db = require('../config/db')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { get } = require('../router/authrouter');

const postaddcart = async (req, res) => {
    const { variantId, quantity } = req.body;
    const userId = req.user.id;
  
    if (!variantId || !quantity) {
      return res.status(400).json({ message: 'Thiếu dữ liệu' });
    }
  
    try {
      // Kiểm tra biến thể có tồn tại không
      const [variantRows] = await db.execute(
        'SELECT * FROM product_variants WHERE id = ?',
        [variantId]
      );
  
      if (variantRows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy biến thể sản phẩm' });
      }
  
      // Kiểm tra xem user đã có biến thể này trong giỏ chưa
      const [cartRows] = await db.execute(
        'SELECT * FROM cart WHERE user_id = ? AND variant_id = ?',
        [userId, variantId]
      );
  
      if (cartRows.length > 0) {
        // Nếu đã có thì cộng thêm
        await db.execute(
          'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND variant_id = ?',
          [quantity, userId, variantId]
        );
      } else {
        // Nếu chưa có thì thêm mới
        await db.execute(
          'INSERT INTO cart (user_id, variant_id, quantity) VALUES (?, ?, ?)',
          [userId, variantId, quantity]
        );
      }
  
      res.json({ message: 'Đã thêm vào giỏ hàng' });
    } catch (err) {
      console.error(err); // ❗ Ghi log chi tiết lỗi ở đây
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  }

  const getcartitems =async (req, res) => {
    try {
      const userId = req.user.id;
  
      // 1. Lấy giỏ hàng
      const [items] = await db.execute(
        `SELECT c.id, c.quantity, v.color, v.size, v.product_id, 
                p.name, p.base_price, p.image
         FROM cart c
         JOIN product_variants v ON c.variant_id = v.id
         JOIN products p ON v.product_id = p.id
         WHERE c.user_id = ?`, 
        [userId]
      );
  
      // 2. Lấy thông tin người dùng + địa chỉ
      const [userRows] = await db.execute(
        `SELECT u.name, u.email, u.phone,
                a.province, a.district, a.commune, a.street_address, a.housing_type
         FROM users u
         LEFT JOIN addresses a ON u.id = a.user_id
         WHERE u.id = ?`,
        [userId]
      );
  
      const userInfo = userRows[0]; // Có thể null nếu chưa nhập địa chỉ
  
      // 3. Truyền vào view
      res.render('cart', {
        cartItems: items,
        userInfo: userInfo || {} // Tránh lỗi nếu chưa có địa chỉ
      });
      
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi lấy dữ liệu giỏ hàng');
    }
  }
  const getodercartitems = async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      const userId = req.user.id;
      const { province, district, commune, street_address, housing_type, items } = req.body;
  
      // 1. Lưu địa chỉ giao hàng
      const [addressResult] = await connection.execute(`
        INSERT INTO addresses (user_id, province, district, commune, street_address, housing_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [userId, province, district, commune, street_address, housing_type]);
  
      const addressId = addressResult.insertId;
  
      // 2. Tính tổng giá
      let totalPrice = 0;
      const parsedItems = items.map(item => JSON.parse(item));
      parsedItems.forEach(item => {
        totalPrice += item.base_price * item.quantity;
      });
  
      // 3. Tạo đơn hàng
      const [orderResult] = await connection.execute(`
        INSERT INTO orders (user_id, address_id, order_date, total_price, status)
        VALUES (?, ?, NOW(), ?, ?)
      `, [userId, addressId, totalPrice, 'pending']);
  
      const orderId = orderResult.insertId;
  
      // 4. Lưu các sản phẩm trong đơn
      const orderItemsData = parsedItems.map(item => [
        orderId,
        item.variant_id || item.variantId || item.id,
        item.quantity,
        item.base_price
      ]);
  
      await connection.query(`
        INSERT INTO order_items (order_id, product_variant_id, quantity, unit_price)
        VALUES ?
      `, [orderItemsData]);
  
      // 5. 🧹 Xóa giỏ hàng
      await connection.execute(
        'DELETE FROM cart WHERE user_id = ?',
        [userId]
      );
  
      await connection.commit();
      res.redirect('order-success'); // hoặc res.send('Đặt hàng thành công');
    } catch (err) {
      console.error(err);
      await connection.rollback();
      res.status(500).send('Lỗi khi đặt hàng');
    } finally {
      connection.release();
    }
  };

 const getodersucess = (req, res) => {
    res.render('order-success');
  }
module.exports = {postaddcart,getcartitems,getodercartitems,getodersucess}
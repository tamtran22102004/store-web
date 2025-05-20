const express = require('express');
const db = require('../config/db')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { get } = require('../router/authrouter');

const getpageorder =async (req, res) => {
    try {
      const userId = req.user.id;
      const [orders] = await db.execute(`
        SELECT o.id, o.order_date, o.total_price, o.status,
               a.province, a.district, a.commune, a.street_address
        FROM orders o
        JOIN addresses a ON o.address_id = a.id
        WHERE o.user_id = ?
        ORDER BY o.order_date DESC
      `, [userId]);
      res.render('orders', { orders });
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi khi lấy đơn hàng');
    }
  }
module.exports = {getpageorder};
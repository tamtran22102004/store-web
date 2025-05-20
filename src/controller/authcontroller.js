const express = require('express');
const db = require('../config/db')
const jwt = require('jsonwebtoken');
const { get } = require('../router/authrouter');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const verifyToken = require('../middleware/auth-middleware');

const postRegister = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Kiểm tra user đã tồn tại chưa
      const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
  
      if (rows.length > 0) {
        return res.render('register', { error: 'Username đã tồn tại' });
      }
  
      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Lưu vào DB
      await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [
        username,
        hashedPassword,
      ]);
  
      // Chuyển về trang đăng nhập
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      res.render('register', { error: 'Có lỗi xảy ra khi đăng ký' });
    }
  }

const getLogin = (req, res) => {
    res.render('login', { error: null });
}
const postLogin = async (req, res) => {
    const { username, password } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    console.log("Rows from DB:", rows);

    if (rows.length === 0) {
      return res.render('login', { error: 'Sai tài khoản hoặc mật khẩu' });
    }

    const user = rows[0];
    console.log("User in DB:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Mật khẩu đúng?", isMatch);

    if (!isMatch) {
      return res.render('login', { error: 'Sai tài khoản hoặc mật khẩu' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Lỗi hệ thống' });
  }
}
 const getLogout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
}
 const getdashboard =  async(req, res) => {
    const user = req.user;
    const [categories, fields] = await db.execute('SELECT * FROM categories;');
    res.render('dashboard', { user,categories});
};
  const getRegister = (req, res) => {
    res.render('register', { error: null });
  }

  
module.exports = {getLogin,postLogin,getLogout,postRegister,getdashboard,getRegister}  

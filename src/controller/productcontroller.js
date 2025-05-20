const express = require('express');
const db = require('../config/db')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const verifyToken = require('../middleware/auth-middleware');

const getProductsByCategoryId = async (req, res) => {
    const categoryId = req.params.categoryId;
    if (!categoryId) return res.status(400).json({ error: 'Thiếu categoryId' });
  
    try {
      const [products] = await db.query('SELECT * FROM products WHERE category_id = ?', [categoryId]);
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi server' });
    }
  }
const getProductDetailbyProductId = async (req, res) => {
    const productId = req.params.productId;
    if (!productId) return res.status(400).json({ error: 'Thiếu productId' });
  
    try {
      // Lấy thông tin sản phẩm
      const [productRows] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
      if (productRows.length === 0) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }
      const product = productRows[0];
  
      // Lấy biến thể sản phẩm
      const [variants] = await db.query('SELECT * FROM product_variants WHERE product_id = ?', [productId]);
  
      res.json({ product, variants });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi server' });
    }
}
const getProductDetailPage = async (req, res) => {
    const productId = req.params.productId;
    if (!productId) return res.status(400).json({ error: 'Thiếu productId' });
  
    try {
      // Lấy thông tin sản phẩm
      const [productRows] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
      if (productRows.length === 0) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }
      const product = productRows[0];
  
      // Lấy biến thể sản phẩm
      const [variants] = await db.query('SELECT * FROM product_variants WHERE product_id = ?', [productId]);
      
      res.render('product-detail', { product, variants});
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi server' });
    }
  }
  
  const searchProducts = async (req, res) => {
    try {
        console.log('Query params:', req.query);  // debug

        const q = req.query.q || '';
const category = req.query.category_id ? parseInt(req.query.category_id) : null;

let sql = `
    SELECT p.*, c.name AS category_name, c.image AS category_image
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE (p.name LIKE ? OR p.description LIKE ?)
`;
const params = [`%${q}%`, `%${q}%`];

if (category) {
    sql += ' AND p.category_id = ?';
    params.push(category);
}

console.log('SQL:', sql);
console.log('Params:', params);

const [rows] = await db.query(sql, params);
res.json(rows);

    } catch (error) {
        console.error('Lỗi tìm kiếm sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi server khi tìm kiếm sản phẩm' });
    }
};
const renderSearchPage = async (req, res) => {
    try {
        const { q, category_id } = req.query;
        let products = [];

        // Lấy danh sách categories để show trong dropdown
        const [categories] = await db.query('SELECT * FROM categories');

        if (q || category_id) {
            const keyword = q || '';
            const category = category_id ? parseInt(category_id) : null;

            let sql = `
                SELECT p.*, c.name AS category_name
                FROM products p
                JOIN categories c ON p.category_id = c.id
                WHERE (p.name LIKE ? OR p.description LIKE ?)
            `;
            const params = [`%${keyword}%`, `%${keyword}%`];

            if (category) {
                sql += ' AND p.category_id = ?';
                params.push(category);
            }

            const [results] = await db.query(sql, params);
            products = results;
        }

        res.render('search', {
            products,
            categories,
            q,
            category_id
        });
    } catch (error) {
        console.error('Lỗi hiển thị trang tìm kiếm:', error);
        res.status(500).send('Lỗi server');
    }
};
module.exports = {getProductsByCategoryId,getProductDetailbyProductId,getProductDetailPage,searchProducts,renderSearchPage};
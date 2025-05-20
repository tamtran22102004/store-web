const express = require('express');
const router = express.Router();
const moment = require('moment');
const crypto = require('crypto');
const qs = require('qs');
const verifyToken = require('../middleware/auth-middleware');
require('dotenv').config();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

// 🔀 Sắp xếp và encode đúng cách (theo mẫu chính thức)
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  }
  return sorted;
}

router.post('/checkout', verifyToken, function (req, res, next) {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
  
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
  
    let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket?.remoteAddress;
    if (ipAddr === '::1') ipAddr = '127.0.0.1';
  
    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURNURL;
  
  //   const orderId = moment(date).format('DDHHmmss');
    const orderId = req.body.orderId; // orderId thực tế trong DB
  
    const amount = req.body.amount || 20000; // default nếu không gửi
    const bankCode = req.body.bankCode || '';
  
    let locale = req.body.language || 'vn';
  
    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: 'Thanh toan GD:' + orderId,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    };
  
    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }
  
    const sortedParams = sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
    sortedParams.vnp_SecureHash = signed;
    const paymentUrl = vnpUrl + '?' + qs.stringify(sortedParams, { encode: false });
  
    console.log('🔗 VNPay URL:', paymentUrl);
    res.redirect(paymentUrl);
  });

// ✅ Callback khi quay về từ VNPay
router.get('/vnpay_return', async function (req, res) {
    const vnp_Params = { ...req.query };
    const secureHash = vnp_Params['vnp_SecureHash'];
  
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];
  
    const sortedParams = sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', process.env.VNP_HASHSECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
    const orderId = vnp_Params['vnp_TxnRef']; // chính là id đơn hàng
    const amount = vnp_Params['vnp_Amount'] / 100; // chia lại vì nhân 100 khi gửi
    const responseCode = vnp_Params['vnp_ResponseCode'];
    const paymentDate = moment(vnp_Params['vnp_PayDate'], 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss');
  
    if (secureHash === signed) {
      if (responseCode === '00') {
        try {
          // 1️⃣ Thêm vào bảng payments
          await db.execute(
            `INSERT INTO payments (order_id, method, paid_amount, paid_at)
             VALUES (?, ?, ?, ?)`,
            [orderId, 'VNPay', amount, paymentDate]
          );
  
          // 2️⃣ Cập nhật trạng thái đơn hàng
          await db.execute(
            `UPDATE orders SET status = 'PAID' WHERE id = ?`,
            [orderId]
          );
  
          return res.render('success', { code: '00' });
        } catch (err) {
          console.error('❌ Lỗi ghi vào database:', err);
          return res.render('success', { code: '99' });
        }
      } else {
        // Thanh toán thất bại
        await db.execute(
          `UPDATE orders SET status = 'FAILED' WHERE id = ?`,
          [orderId]
        );
        return res.render('success', { code: responseCode });
      }
    } else {
      return res.render('success', { code: '97' }); // Sai checksum
    }
  });

  
module.exports = router;

const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect('/login');
    }

    req.user = decoded;
    res.locals.userName = decoded.username; // ✅ GẮN Ở ĐÂY
    next();
  });
};

module.exports = verifyToken;

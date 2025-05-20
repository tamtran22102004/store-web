// middleware/attachUser.js
const jwt = require('jsonwebtoken');

const attachuser = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.userName = decoded.username;
    } catch (err) {
      res.locals.userName = null;
    }
  } else {
    res.locals.userName = null;
  }
  next();
};

module.exports = attachuser;

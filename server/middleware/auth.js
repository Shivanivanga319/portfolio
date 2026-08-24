const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { isDBConnected } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_portfolio_2026'
      );

      if (isDBConnected()) {
        req.admin = await Admin.findById(decoded.id).select('-password');
      } else {
        req.admin = {
          _id: decoded.id || 'fallback_admin_id',
          username: decoded.username || process.env.ADMIN_USERNAME || 'admin',
        };
      }

      if (!req.admin) {
        return res.status(401).json({ success: false, message: 'Admin account not found' });
      }

      next();
    } catch (error) {
      console.error('JWT Auth Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };

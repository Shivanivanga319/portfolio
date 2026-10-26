const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { isDBConnected } = require('../config/db');

/**
 * Authentication Middleware
 * NOTE: Login requirement is temporarily bypassed as requested.
 * If a token is provided it verifies it; otherwise it safely grants admin access.
 */
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
      return next();
    } catch (error) {
      console.warn('JWT verification warning:', error.message);
    }
  }

  // Temporary development bypass: allow admin actions without requiring login
  req.admin = {
    _id: 'bypassed_admin_id',
    username: process.env.ADMIN_USERNAME || 'admin',
  };
  next();
};

module.exports = { protect };

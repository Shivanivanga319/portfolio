const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');

// In-memory admin password storage for fallback mode
let fallbackAdmin = {
  username: process.env.ADMIN_USERNAME || 'admin',
  passwordHash: null,
};

const getFallbackHash = async () => {
  if (!fallbackAdmin.passwordHash) {
    const rawPass = process.env.ADMIN_PASSWORD || 'admin123';
    const salt = await bcrypt.genSalt(10);
    fallbackAdmin.passwordHash = await bcrypt.hash(rawPass, salt);
  }
  return fallbackAdmin.passwordHash;
};

// Helper to generate JWT
const generateToken = (id, username) => {
  return jwt.sign(
    { id, username },
    process.env.JWT_SECRET || 'super_secret_jwt_key_portfolio_2026',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/login
// @desc    Authenticate admin & return JWT
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password',
      });
    }

    const cleanUsername = username.toLowerCase().trim();

    if (isDBConnected()) {
      const admin = await Admin.findOne({ username: cleanUsername });
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials',
        });
      }

      const isMatch = await admin.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials',
        });
      }

      const token = generateToken(admin._id, admin.username);
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        admin: {
          id: admin._id,
          username: admin.username,
        },
      });
    }

    // Fallback in-memory auth check
    const expectedUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
    if (cleanUsername !== expectedUsername) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    const hash = await getFallbackHash();
    const isMatch = await bcrypt.compare(password, hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    const token = generateToken('fallback_admin_id', cleanUsername);
    return res.json({
      success: true,
      message: 'Login successful (Local Mode)',
      token,
      admin: {
        id: 'fallback_admin_id',
        username: cleanUsername,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @route   GET /api/auth/verify
// @desc    Verify current admin JWT token
// @access  Protected
router.get('/verify', protect, (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin._id,
      username: req.admin.username,
    },
  });
});

// @route   POST /api/auth/change-password
// @desc    Change admin password
// @access  Protected
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    if (isDBConnected()) {
      const admin = await Admin.findById(req.admin._id);
      const isMatch = await admin.matchPassword(currentPassword);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match',
        });
      }

      admin.password = newPassword;
      await admin.save();

      return res.json({
        success: true,
        message: 'Password updated successfully in database',
      });
    }

    // Fallback mode password change
    const hash = await getFallbackHash();
    const isMatch = await bcrypt.compare(currentPassword, hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match',
      });
    }

    const salt = await bcrypt.genSalt(10);
    fallbackAdmin.passwordHash = await bcrypt.hash(newPassword, salt);

    res.json({
      success: true,
      message: 'Password updated successfully (Local Mode)',
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ success: false, message: 'Server error updating password' });
  }
});

module.exports = router;

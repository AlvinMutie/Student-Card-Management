const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const userResult = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Verify password using bcrypt
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Get additional user info based on role
    let userInfo = { id: user.id, email: user.email, role: user.role };

    if (user.role === 'parent') {
      const parentResult = await pool.query(
        'SELECT id, name, email, phone FROM parents WHERE user_id = $1',
        [user.id]
      );
      if (parentResult.rows.length > 0) {
        userInfo = { ...userInfo, ...parentResult.rows[0] };
      }
    } else if (user.role === 'admin') {
      userInfo.name = 'Admin';
    } else if (user.role === 'guard') {
      userInfo.name = 'Security Guard';
    }

    res.json({
      token,
      user: userInfo
    });
  } catch (error) {
    console.error('Login error:', error);

    const errorMessage =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message || 'Internal server error';

    res.status(500).json({ error: errorMessage });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let userInfo = { id: userId, email: req.user.email, role: role };

    if (role === 'parent') {
      const parentResult = await pool.query(
        'SELECT id, name, email, phone FROM parents WHERE user_id = $1',
        [userId]
      );
      if (parentResult.rows.length > 0) {
        userInfo = { ...userInfo, ...parentResult.rows[0] };
      }
    } else if (role === 'admin') {
      userInfo.name = 'Admin';
    } else if (role === 'guard') {
      userInfo.name = 'Security Guard';
    }

    res.json({ user: userInfo });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

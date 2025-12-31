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
      'SELECT id, full_name, email, password, role, status FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];
    console.log('🔍 Login attempt for:', email, 'Status:', user.status);

    // 1. Check if user is approved
    if (user.status !== 'approved') {
      if (user.status === 'pending') {
        return res.status(403).json({ error: 'Account awaiting admin approval' });
      } else {
        return res.status(403).json({ error: 'Account is disabled. Please contact admin.' });
      }
    }

    // 2. Critical Check: Ensure password exists in DB to prevent bcrypt crash
    if (!user.password) {
      console.error('❌ Security Alert: User found but has NULL password in DB:', email);
      return res.status(401).json({ error: 'Account not fully set up. Contact system administrator.' });
    }

    // 3. Verify password using bcrypt
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.full_name },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('❌ Login Error Details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      error: 'An unexpected error occurred during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Profile endpoint (Replacement for /me as requested)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, full_name, email, phone, role, status, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// Keep /me for backward compatibility if needed, but point to same logic
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, full_name, email, phone, role, status FROM users WHERE id = $1',
      [userId]
    );
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

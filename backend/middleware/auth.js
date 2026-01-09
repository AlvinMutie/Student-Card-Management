const pool = require('../config/database');
const jwt = require('jsonwebtoken');

// Authenticate: check token and attach user info from DB
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');

    // Admin and Guards might only exist in 'users' table
    if (payload.role === 'admin' || payload.role === 'guard') {
      req.user = payload;
      return next();
    }

    // Determine table based on role in token for profile info
    let table;
    if (payload.role === 'parent') table = 'parents';
    else if (payload.role === 'staff') table = 'staff';
    else {
      req.user = payload;
      return next();
    }

    // Fetch profile info using user_id
    const result = await pool.query(
      `SELECT id as "profileRecordId", user_id FROM ${table} WHERE user_id = $1`,
      [payload.id]
    );

    if (result.rows.length === 0) {
      req.user = payload;
    } else {
      // Prioritize payload (token) for core identity, add profile info
      req.user = {
        ...result.rows[0],
        ...payload, // Ensure token payload (identity) wins if keys conflict
        profileRecordId: result.rows[0].profileRecordId
      };
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.name, err.message);
    return res.status(403).json({ error: `Invalid or expired token: ${err.message}` });
  }
};

// Authorize roles (supports multiple arguments or a single array)
const authorizeRole = (...allowedRoles) => {
  // Flatten if first arg is an array: authorizeRole(['admin', 'guard'])
  const roles = Array.isArray(allowedRoles[0]) ? allowedRoles[0] : allowedRoles;

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // BYPASS: Admins can access everything for support/monitoring
    if (req.user.role === 'admin') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};

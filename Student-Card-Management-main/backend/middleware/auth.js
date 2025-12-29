const jwt = require('jsonwebtoken');
const db = require('../db'); // adjust to your actual DB module

// Authenticate: check token and attach user info from DB
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // TEMPORARY fallback: stub admin user if token missing
    req.user = { id: 0, role: 'admin' };
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Determine table based on role in token
    let table;
    if (payload.role === 'parent') table = 'parents';
    else table = 'staff'; // admin and staff are in staff table

    // Fetch user info from the correct table
    const result = await db.query(`SELECT id, email, role FROM ${table} WHERE id = $1`, [payload.id]);
    
    if (!result.rows[0]) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Authorize roles
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
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

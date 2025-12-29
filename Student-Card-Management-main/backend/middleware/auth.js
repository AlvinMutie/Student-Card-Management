const pool = require('../config/database');

// Authenticate: check token and attach user info from DB
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token provided, we can't authenticate
    // (Unless you want public access, but usually we return 401)
    // For now, keeping original fallback behavior but it's risky:
    // req.user = { id: 0, role: 'admin' };
    // return next();
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');

    // Basic user info from token is often enough, but let's verify existence
    // Admin users might only exist in 'users' table, not 'staff'
    if (payload.role === 'admin') {
      req.user = payload; // or query users table if needed
      return next();
    }

    // Determine table based on role in token
    let table;
    if (payload.role === 'parent') table = 'parents';
    else if (payload.role === 'staff') table = 'staff';
    else {
      // unknown role
      req.user = payload;
      return next();
    }

    // Fetch user info from the correct table using user_id FK
    const result = await pool.query(`SELECT id, email, role, user_id FROM ${table} WHERE user_id = $1`, [payload.id]);

    if (result.rows.length === 0) {
      // User has valid token but no profile record? 
      // Fallback to token payload
      req.user = payload;
    } else {
      req.user = { ...payload, ...result.rows[0] };
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
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

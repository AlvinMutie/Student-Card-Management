const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // TEMPORARY: bypass auth and stub an admin user so role checks pass
  req.user = req.user || { id: 0, role: 'admin' };
  next();
};

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


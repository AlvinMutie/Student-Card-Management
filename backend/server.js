const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const studentsRoutes = require('./routes/students');
const parentsRoutes = require('./routes/parents');
const staffRoutes = require('./routes/staff');

const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

// Middleware
// CORS configuration - allow all origins in development for easier testing
const isProduction = process.env.NODE_ENV === 'production';

const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const allowedOrigins = parseOrigins(
  process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS
);

const wildcardMatch = (origin, pattern) => {
  if (!pattern.includes('*')) {
    return origin === pattern;
  }
  const regex = new RegExp(`^${pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);
  return regex.test(origin);
};

const corsOptions = {
  origin(origin, callback) {
    if (!isProduction || !origin) {
      return callback(null, true);
    }

    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.some((allowed) => wildcardMatch(origin, allowed));

    if (isAllowed) {
      return callback(null, true);
    }

    console.warn(`CORS blocked request from origin: ${origin}`);
    return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route - Serve HTML page or JSON based on Accept header
app.get('/', (req, res) => {
  // If browser requests HTML, serve the welcome page
  if (req.accepts('html')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  
  // Otherwise return JSON
  res.json({
    message: 'Student Card Management API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      students: {
        getAll: 'GET /api/students',
        getById: 'GET /api/students/:id',
        getMyStudents: 'GET /api/students/parent/my-students',
        create: 'POST /api/students',
        update: 'PUT /api/students/:id',
        delete: 'DELETE /api/students/:id'
      },
      parents: {
        getAll: 'GET /api/parents',
        getById: 'GET /api/parents/:id',
        create: 'POST /api/parents',
        update: 'PUT /api/parents/:id',
        delete: 'DELETE /api/parents/:id'
      },
      staff: {
        getAll: 'GET /api/staff',
        getById: 'GET /api/staff/:id',
        create: 'POST /api/staff',
        update: 'PUT /api/staff/:id',
        delete: 'DELETE /api/staff/:id'
      }
    },
    documentation: 'See README.md for full API documentation',
    testHealth: 'Visit /api/health to check server status'
  });
});

// API info endpoint (JSON format)
app.get('/api', (req, res) => {
  res.json({
    message: 'Student Card Management API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      students: {
        getAll: 'GET /api/students',
        getById: 'GET /api/students/:id',
        getMyStudents: 'GET /api/students/parent/my-students',
        create: 'POST /api/students',
        update: 'PUT /api/students/:id',
        delete: 'DELETE /api/students/:id'
      },
      parents: {
        getAll: 'GET /api/parents',
        getById: 'GET /api/parents/:id',
        create: 'POST /api/parents',
        update: 'PUT /api/parents/:id',
        delete: 'DELETE /api/parents/:id'
      },
      staff: {
        getAll: 'GET /api/staff',
        getById: 'GET /api/staff/:id',
        create: 'POST /api/staff',
        update: 'PUT /api/staff/:id',
        delete: 'DELETE /api/staff/:id'
      }
    },
    documentation: 'See README.md for full API documentation',
    testHealth: 'Visit /api/health to check server status'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/parents', parentsRoutes);
app.use('/api/staff', staffRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Student Card Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;


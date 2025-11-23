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

// Simplified CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    // Allow localhost for development and Netlify frontend
    const allowedOrigins = [
      'http://localhost:5500',            // optional for local testing
      process.env.CORS_ORIGIN             // Netlify frontend URL
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route - serve HTML page or JSON
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  const migrate = require('./migrations/migrate');

app.get('/run-migrations-secret-123', async (req, res) => {
  try {
    await migrate();
    res.send("Migrations ran successfully");//
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

  
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

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Student Card Management API',
    status: 'running',
    version: '1.0.0',
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

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    const pool = require('./config/database');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log('Database time:', result.rows[0].now);
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Users table exists');
    } else {
      console.warn('⚠️  WARNING: Users table does not exist. Run migrations!');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      message: error.message
    });
    console.error('Make sure DATABASE_URL is set correctly and database is accessible');
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  await testDatabaseConnection();
});

module.exports = app;

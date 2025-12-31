const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const studentsRoutes = require('./routes/students');
const parentsRoutes = require('./routes/parents');
const staffRoutes = require('./routes/staff');
const adminRoutes = require('./routes/admin');
const setupRoutes = require('./routes/setup');
const paymentsRoutes = require('./routes/payments');
const visitorRoutes = require('./routes/visitors');

const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

// Middleware: CORS configuration
const allowedOrigins = [
  'http://localhost:5500',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://shuleniadvantage.co.ke',
  'https://shuleniadvantage.co.ke',
  'http://www.shuleniadvantage.co.ke',
  'https://www.shuleniadvantage.co.ke'
].filter(Boolean);


const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman or server-to-server requests
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`CORS blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  res.json({
    message: 'Student Card Management API',
    status: 'running',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/parents', parentsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/visitors', visitorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Student Card Management API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Test database connection
async function testDatabaseConnection() {
  try {
    const pool = require('./config/database');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log('Database time:', result.rows[0].now);

    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('✅ Users table exists');

      // AUTO-HEAL: Ensure staff/parents have user_id
      try {
        await pool.query(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS user_id INTEGER`);
        await pool.query(`ALTER TABLE parents ADD COLUMN IF NOT EXISTS user_id INTEGER`);
        // Foreign keys
        await pool.query(`ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_user_id_fkey`);
        await pool.query(`ALTER TABLE staff ADD CONSTRAINT staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`);
        console.log('✅ Schema patched: staff/parents user_id validated.');
      } catch (patchErr) {
        console.warn('⚠️ Schema patch warning:', patchErr.message);
      }

    } else {
      console.warn('⚠️  WARNING: Users table does not exist. Run migrations!');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Make sure DATABASE_URL is set correctly and database is accessible');
  }
}

// Start server - listen on all interfaces
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  await testDatabaseConnection();
});

module.exports = app;

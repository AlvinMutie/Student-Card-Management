const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Check database status
router.get('/status', async (req, res) => {
  try {
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    const usersTableExists = tableCheck.rows[0].exists;

    let userCount = 0;
    let adminCount = 0;
    let parentCount = 0;
    let staffCount = 0;
    let studentCount = 0;
    let adminUsers = [];

    if (usersTableExists) {
      const userCountResult = await pool.query('SELECT COUNT(*) as count FROM users');
      userCount = parseInt(userCountResult.rows[0].count);

      const adminResult = await pool.query(
        "SELECT email, role FROM users WHERE role = 'admin'"
      );
      adminCount = adminResult.rows.length;
      adminUsers = adminResult.rows;

      const parentResult = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'parent'");
      parentCount = parseInt(parentResult.rows[0].count);

      const staffResult = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'staff'");
      staffCount = parseInt(staffResult.rows[0].count);
    }

    // Check students table
    let studentsTableExists = false;
    if (usersTableExists) {
      const studentsTableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'students'
        );
      `);
      studentsTableExists = studentsTableCheck.rows[0].exists;
      
      if (studentsTableExists) {
        const studentResult = await pool.query('SELECT COUNT(*) as count FROM students');
        studentCount = parseInt(studentResult.rows[0].count);
      }
    }

    res.json({
      databaseConnected: true,
      usersTableExists,
      studentsTableExists,
      userCount,
      adminCount,
      parentCount,
      staffCount,
      studentCount,
      adminUsers,
      message: usersTableExists 
        ? (userCount === 0 
          ? 'Database tables exist but no users found. Run setup to create admin user or load test data.'
          : `Database is set up. Found ${userCount} user(s): ${adminCount} admin(s), ${parentCount} parent(s), ${staffCount} staff. ${studentCount} student(s).`)
        : 'Database tables do not exist. Run migrations first.'
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      databaseConnected: false,
      error: error.message,
      message: 'Cannot connect to database. Check DATABASE_URL environment variable.'
    });
  }
});

// Create admin user endpoint
router.post('/create-admin', async (req, res) => {
  try {
    const { email = 'admin@hechlink.edu', password = 'admin123' } = req.body;

    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      return res.status(400).json({
        error: 'Users table does not exist',
        message: 'Please run migrations first. Visit /api/setup/run-migrations'
      });
    }

    // Check if admin already exists
    const existingUser = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      // Update password
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET password_hash = $1, role = $2 WHERE email = $3',
        [passwordHash, 'admin', email]
      );

      return res.json({
        success: true,
        message: `Admin user "${email}" password updated successfully`,
        email,
        action: 'updated'
      });
    }

    // Create new admin user
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, passwordHash, 'admin']
    );

    res.json({
      success: true,
      message: `Admin user "${email}" created successfully`,
      user: result.rows[0],
      credentials: {
        email,
        password: 'admin123 (default)'
      },
      action: 'created'
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to create admin user'
    });
  }
});

// Run migrations endpoint
router.get('/run-migrations', async (req, res) => {
  try {
    const schemaPath = path.join(__dirname, '../migrations/schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      return res.status(404).json({
        error: 'Schema file not found',
        message: 'Cannot find migrations/schema.sql'
      });
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schemaSQL);

    res.json({
      success: true,
      message: 'Migrations completed successfully',
      tablesCreated: true
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      error: error.message,
      message: 'Migration failed. Check server logs for details.'
    });
  }
});

// Seed database with admin user
router.post('/seed-admin', async (req, res) => {
  try {
    const { email = 'admin@hechlink.edu', password = 'admin123' } = req.body;

    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      return res.status(400).json({
        error: 'Users table does not exist',
        message: 'Please run migrations first'
      });
    }

    // Create or update admin user
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) 
       DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
       RETURNING id, email, role`,
      [email, passwordHash, 'admin']
    );

    res.json({
      success: true,
      message: `Admin user "${email}" is ready`,
      user: result.rows[0],
      credentials: {
        email,
        password: password === 'admin123' ? 'admin123 (default)' : 'custom'
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to seed admin user'
    });
  }
});

// Load comprehensive test data
router.post('/load-test-data', async (req, res) => {
  try {
    // Check if tables exist
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      return res.status(400).json({
        error: 'Users table does not exist',
        message: 'Please run migrations first'
      });
    }

    const seedPath = path.join(__dirname, '../migrations/comprehensive-seed.sql');
    
    if (!fs.existsSync(seedPath)) {
      return res.status(404).json({
        error: 'Seed file not found',
        message: 'Cannot find migrations/comprehensive-seed.sql'
      });
    }

    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    // Execute seed script
    await pool.query(seedSQL);

    // Get counts after seeding
    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as admins,
        (SELECT COUNT(*) FROM users WHERE role = 'parent') as parents,
        (SELECT COUNT(*) FROM users WHERE role = 'staff') as staff,
        (SELECT COUNT(*) FROM students) as students
    `);

    const countsData = counts.rows[0];

    res.json({
      success: true,
      message: 'Test data loaded successfully!',
      data: {
        admins: parseInt(countsData.admins),
        parents: parseInt(countsData.parents),
        staff: parseInt(countsData.staff),
        students: parseInt(countsData.students)
      },
      credentials: {
        admin: { email: 'admin@hechlink.edu', password: 'admin123' },
        parents: { email: 'sarah.onyango@example.com', password: 'parent123' },
        staff: { email: 'staff1@hechlink.edu', password: 'parent123' }
      }
    });
  } catch (error) {
    console.error('Load test data error:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to load test data. Check server logs for details.'
    });
  }
});

// Test login endpoint (for debugging)
router.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required'
      });
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.json({
        exists: false,
        message: `User with email "${email}" does not exist in database`
      });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    return res.json({
      exists: true,
      passwordValid: validPassword,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      message: validPassword 
        ? 'Login credentials are valid!'
        : 'Password is incorrect'
    });
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;


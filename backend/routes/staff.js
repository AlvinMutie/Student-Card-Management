const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all staff (admin only)
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    // We join users and staff to see everyone, including those registered on web but not yet in staff table
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.full_name as name, 
        u.email, 
        u.phone, 
        u.role, 
        u.status,
        s.staff_no,
        s.department,
        s.approved,
        u.created_at
      FROM users u
      LEFT JOIN staff s ON u.id = s.user_id
      WHERE u.role NOT IN ('admin', 'parent')
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get staff by ID
router.get('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, staff_no, name, email, phone, department, approved, created_at FROM staff WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public staff registration (Website only)
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { full_name, email, phone, password, role, staff_no, department } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: 'Full name, email, password, and role are required' });
    }

    await client.query('BEGIN');

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 1. Insert into users table
    const userResult = await client.query(
      `INSERT INTO users (full_name, email, phone, password, role, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id`,
      [full_name, email, phone || null, passwordHash, role]
    );
    const userId = userResult.rows[0].id;

    // 2. Insert into staff table (so they show up in Admin Dashboard)
    await client.query(
      `INSERT INTO staff (user_id, staff_no, name, email, phone, department, approved)
       VALUES ($1, $2, $3, $4, $5, $6, false)`,
      [userId, staff_no || `WEB-${Date.now()}`, full_name, email, phone || null, department || null]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Registration successful. Waiting for admin approval.',
      user: { id: userId, full_name, email, role, status: 'pending' }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Email or Staff Number already exists' });
    }
    console.error('Staff registration error:', error);
    res.status(500).json({ error: 'Failed to register staff account' });
  } finally {
    client.release();
  }
});

// Create staff (Internal/Admin use)
router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { staff_no, name, email, phone, department, password, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    await client.query('BEGIN');

    // Create user record
    const passwordHash = await bcrypt.hash(password || 'Staff123!', 10);
    const userResult = await client.query(
      'INSERT INTO users (full_name, email, phone, password, role, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, email, phone || null, passwordHash, role || 'staff', 'approved']
    );
    const userId = userResult.rows[0].id;

    // Create staff record (Optional: keep if you need staff_no/department)
    const result = await client.query(
      `INSERT INTO staff (user_id, staff_no, name, email, phone, department, approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, staff_no, name, email, phone, department, approved, created_at`,
      [userId, staff_no || `STF${Date.now()}`, name, email, phone || null, department || null, true]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create staff error:', error);
    res.status(500).json({ error: error.code === '23505' ? 'Staff number or email already exists' : 'Internal server error' });
  } finally {
    client.release();
  }
});

// Update staff (admin only)
router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_no, name, email, phone, department, approved } = req.body;

    const result = await pool.query(
      `UPDATE staff
       SET staff_no = COALESCE($1, staff_no),
           name = COALESCE($2, name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           department = COALESCE($5, department),
           approved = COALESCE($6, approved),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, staff_no, name, email, phone, department, approved, created_at`,
      [staff_no, name, email, phone, department, approved, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete staff (admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM staff WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


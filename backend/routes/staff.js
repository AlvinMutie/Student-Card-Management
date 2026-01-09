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
        COALESCE(s.staff_no, 'PENDING') as staff_no,
        COALESCE(s.department, 'Not Assigned') as department,
        COALESCE(s.approved, false) as approved,
        u.created_at
      FROM users u
      LEFT JOIN staff s ON u.id = s.user_id
      WHERE u.role NOT IN ('admin', 'parent')
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: `server error: ${error.message}` });
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

// Create staff (Internal/Admin use) - "Smart" Creation
router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { staff_no, name, email, phone, department, password, role, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query('SELECT id, role, status FROM users WHERE email = $1', [email]);

    let userId;
    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      // "Upgrade" existing user to staff if they are not admin/parent, or just update info
      await client.query(
        `UPDATE users 
         SET full_name = $1, phone = COALESCE($2, phone), role = 'staff', status = $3, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $4`,
        [name, phone || null, status || 'approved', userId]
      );
    } else {
      // Create new user
      const passwordHash = await bcrypt.hash(password || 'Staff123!', 10);
      const userResult = await client.query(
        'INSERT INTO users (full_name, email, phone, password, role, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [name, email, phone || null, passwordHash, 'staff', status || 'approved']
      );
      userId = userResult.rows[0].id;
    }

    // Ensure staff record exists (UPSERT for staff table)
    const staffCheck = await client.query('SELECT id FROM staff WHERE user_id = $1', [userId]);
    let staffResult;

    if (staffCheck.rows.length > 0) {
      staffResult = await client.query(
        `UPDATE staff 
         SET staff_no = COALESCE($1, staff_no), name = $2, email = $3, phone = COALESCE($4, phone), 
             department = COALESCE($5, department), approved = $6, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $7
         RETURNING id as staff_table_id, staff_no, name, email, phone, department, approved, created_at`,
        [staff_no, name, email, phone || null, department || null, (status || 'approved') === 'approved', userId]
      );
    } else {
      staffResult = await client.query(
        `INSERT INTO staff (user_id, staff_no, name, email, phone, department, approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id as staff_table_id, staff_no, name, email, phone, department, approved, created_at`,
        [userId, staff_no || `STF${Date.now()}`, name, email, phone || null, department || null, (status || 'approved') === 'approved']
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      ...staffResult.rows[0],
      id: userId
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create staff error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Staff Number already exists for another account.' });
    }
    res.status(500).json({ error: 'Internal server error' });
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
       WHERE user_id = $7
       RETURNING id, staff_no, name, email, phone, department, approved, created_at`,
      [staff_no, name, email, phone, department, approved, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update staff error:', error);
    const isConflict = error.code === '23505';
    res.status(isConflict ? 400 : 500).json({
      error: isConflict ? 'Email or Staff Number already exists' : 'Internal server error'
    });
  }
});

// Delete staff (admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params; // receiving user_id from frontend

    // We delete from USERS, which will cascade delete the STAFF record
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      // Fallback: try deleting from staff just in case ID was actually a staff_id (backward compatibility)
      const staffRes = await pool.query('DELETE FROM staff WHERE id = $1 RETURNING user_id', [id]);
      if (staffRes.rows.length > 0) {
        // If we deleted a staff record, we should try to cleanup the user too
        await pool.query('DELETE FROM users WHERE id = $1', [staffRes.rows[0].user_id]);
        return res.json({ message: 'Staff deleted successfully' });
      }
      return res.status(404).json({ error: 'Staff/User not found' });
    }

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


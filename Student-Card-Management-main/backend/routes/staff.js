const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all staff (admin only)
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, staff_no, name, email, phone, department, approved, created_at FROM staff ORDER BY created_at DESC'
    );
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

// Create staff (admin only or registration)
router.post('/', async (req, res) => {
  try {
    const { staff_no, name, email, phone, department, password } = req.body;

    if (!staff_no || !name) {
      return res.status(400).json({ error: 'Staff number and name are required' });
    }

    // Hash password if provided
    let passwordHash = null;
    let userId = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
      const userResult = await pool.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
        [email || `${staff_no}@school.edu`, passwordHash, 'staff']
      );
      userId = userResult.rows[0].id;
    }

    const result = await pool.query(
      `INSERT INTO staff (user_id, staff_no, name, email, phone, department, approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, staff_no, name, email, phone, department, approved, created_at`,
      [userId, staff_no, name, email || null, phone || null, department || null, false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Staff number or email already exists' });
    }
    console.error('Create staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
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


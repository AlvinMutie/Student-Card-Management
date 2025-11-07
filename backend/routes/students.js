const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all students (admin only)
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, p.name as parent_name, p.email as parent_email, p.phone as parent_phone
       FROM students s
       LEFT JOIN parents p ON s.parent_id = p.id
       ORDER BY s.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    let query;
    let params;

    if (role === 'admin') {
      // Admin can view any student
      query = `SELECT s.*, p.name as parent_name, p.email as parent_email, p.phone as parent_phone
               FROM students s
               LEFT JOIN parents p ON s.parent_id = p.id
               WHERE s.id = $1`;
      params = [id];
    } else if (role === 'parent') {
      // Parent can only view their own children
      query = `SELECT s.*, p.name as parent_name, p.email as parent_email, p.phone as parent_phone
               FROM students s
               LEFT JOIN parents p ON s.parent_id = p.id
               WHERE s.id = $1 AND p.user_id = $2`;
      params = [id, userId];
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get students for parent (parent's children)
router.get('/parent/my-students', authenticateToken, authorizeRole('parent'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get parent_id from user_id
    const parentResult = await pool.query(
      'SELECT id FROM parents WHERE user_id = $1',
      [userId]
    );

    if (parentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const parentId = parentResult.rows[0].id;

    // Get all students for this parent
    const result = await pool.query(
      `SELECT s.*, p.name as parent_name, p.email as parent_email, p.phone as parent_phone
       FROM students s
       LEFT JOIN parents p ON s.parent_id = p.id
       WHERE s.parent_id = $1
       ORDER BY s.created_at DESC`,
      [parentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get parent students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create student (admin only)
router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { adm, name, nemis, class: className, fee_balance, parent_id, photo_url } = req.body;

    if (!adm || !name) {
      return res.status(400).json({ error: 'Admission number and name are required' });
    }

    const result = await pool.query(
      `INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [adm, name, nemis || null, className || null, fee_balance || 0, parent_id || null, photo_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Student with this admission number already exists' });
    }
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update student (admin only)
router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { adm, name, nemis, class: className, fee_balance, parent_id, photo_url } = req.body;

    const result = await pool.query(
      `UPDATE students
       SET adm = COALESCE($1, adm),
           name = COALESCE($2, name),
           nemis = COALESCE($3, nemis),
           class = COALESCE($4, class),
           fee_balance = COALESCE($5, fee_balance),
           parent_id = COALESCE($6, parent_id),
           photo_url = COALESCE($7, photo_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [adm, name, nemis, className, fee_balance, parent_id, photo_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete student (admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


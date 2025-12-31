const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all parents (admin only)
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, created_at FROM parents ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get parent by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, email, phone, created_at FROM parents WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get parent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update parent (admin only)
router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const result = await pool.query(
      `UPDATE parents
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, user_id, name, email, phone, created_at`,
      [name, email, phone, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const parent = result.rows[0];

    // Keep user email in sync when a parent account exists
    if (email && parent.user_id) {
      await pool.query(
        'UPDATE users SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [email, parent.user_id]
      );
    }

    const { user_id, ...responseBody } = parent;
    res.json(responseBody);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Update parent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create parent (admin only or registration)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Hash password if provided
    let passwordHash = null;
    if (password && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Create user account if password provided
    let userId = null;
    if (passwordHash) {
      const userResult = await pool.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
        [email, passwordHash, 'parent']
      );
      userId = userResult.rows[0].id;
    }

    // Create parent record
    const result = await pool.query(
      `INSERT INTO parents (user_id, name, email, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, created_at`,
      [userId, name, email, phone || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Create parent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current parent's profile (for logged-in parent)
router.get('/me/profile', authenticateToken, authorizeRole('parent'), async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT p.id, p.name, p.email, p.phone, p.created_at, u.email as user_email
       FROM parents p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parent profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get parent profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current parent's profile (for logged-in parent)
router.put('/me/profile', authenticateToken, authorizeRole('parent'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    // Get parent id from user_id
    const parentResult = await pool.query(
      'SELECT id FROM parents WHERE user_id = $1',
      [userId]
    );

    if (parentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const parentId = parentResult.rows[0].id;

    const result = await pool.query(
      `UPDATE parents
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, email, phone, created_at`,
      [name, phone, parentId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update parent profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password for current parent
router.put('/me/password', authenticateToken, authorizeRole('parent'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get current password hash
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Link one or more students to the current parent account
router.post('/me/students/link', authenticateToken, authorizeRole('parent'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { admissions } = req.body;

    if (!Array.isArray(admissions) || admissions.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of admission numbers.' });
    }

    const sanitizedAdmissions = admissions
      .map(adm => (typeof adm === 'string' || typeof adm === 'number') ? String(adm).trim().toUpperCase() : '')
      .filter(Boolean);

    if (sanitizedAdmissions.length === 0) {
      return res.status(400).json({ error: 'No valid admission numbers supplied.' });
    }

    const parentResult = await pool.query(
      'SELECT id FROM parents WHERE user_id = $1',
      [userId]
    );

    if (parentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Parent profile not found' });
    }

    const parentId = parentResult.rows[0].id;
    const summary = [];

    for (const admission of sanitizedAdmissions) {
      const studentResult = await pool.query(
        'SELECT id, name, parent_id FROM students WHERE UPPER(adm) = $1',
        [admission]
      );

      if (studentResult.rows.length === 0) {
        summary.push({ admission, status: 'not_found' });
        continue;
      }

      const student = studentResult.rows[0];

      if (student.parent_id && student.parent_id !== parentId) {
        summary.push({
          admission,
          studentName: student.name,
          status: 'linked_to_other_parent'
        });
        continue;
      }

      if (student.parent_id === parentId) {
        summary.push({
          admission,
          studentName: student.name,
          status: 'already_linked'
        });
        continue;
      }

      await pool.query(
        'UPDATE students SET parent_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [parentId, student.id]
      );

      summary.push({
        admission,
        studentName: student.name,
        status: 'linked'
      });
    }

    res.json({
      parentId,
      summary,
      linkedCount: summary.filter(item => item.status === 'linked').length
    });
  } catch (error) {
    console.error('Link students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update parent (admin only)
router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const result = await pool.query(
      `UPDATE parents
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, email, phone, created_at`,
      [name, email, phone, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update parent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete parent (admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM parents WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    res.json({ message: 'Parent deleted successfully' });
  } catch (error) {
    console.error('Delete parent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


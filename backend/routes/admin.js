const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Approve staff account
router.put('/approve-staff/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "UPDATE users SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND role NOT IN ('admin', 'parent') RETURNING id, full_name, email, role, status",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Staff account not found or cannot be approved' });
        }

        res.json({
            message: 'Staff account approved successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Approve staff error:', error);
        res.status(500).json({ error: 'Failed to approve staff account' });
    }
});

// Reject/Disable staff account
router.put('/disable-staff/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "UPDATE users SET status = 'disabled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND role != 'admin' RETURNING id, full_name, email, role, status",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'User account disabled successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Disable user error:', error);
        res.status(500).json({ error: 'Failed to disable user account' });
    }
});

// Get all pending staff
router.get('/pending-staff', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, full_name, email, phone, role, status, created_at FROM users WHERE status = 'pending' AND role NOT IN ('admin', 'parent') ORDER BY created_at DESC"
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get pending staff error:', error);
        res.status(500).json({ error: 'Failed to retrieve pending staff' });
    }
});

module.exports = router;

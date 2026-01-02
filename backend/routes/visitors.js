const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

/**
 * @desc    Get all active visitors
 * @access  Private (Admin or Guard)
 */
router.get('/', authenticateToken, authorizeRole(['admin', 'guard', 'secretary']), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM visitors ORDER BY check_in_time DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Get visitors error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @desc    Register a new visitor (Create QR Token)
 * @access  Private (Admin or Guard)
 */
router.post('/check-in', authenticateToken, authorizeRole(['admin', 'guard', 'secretary']), async (req, res) => {
    try {
        const { name, id_number, phone, plate_number, purpose, host_name } = req.body;

        if (!name) return res.status(400).json({ error: 'Visitor name is required' });

        // Generate a unique token for the QR code
        const qr_token = crypto.randomBytes(16).toString('hex');

        const result = await pool.query(
            `INSERT INTO visitors (name, id_number, phone, plate_number, purpose, host_name, qr_token, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
            [name, id_number, phone, plate_number, purpose, host_name, qr_token]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ error: 'Failed to register visitor' });
    }
});

/**
 * @desc    Verify visitor by QR token
 * @access  Private (Guard)
 */
router.get('/verify/:token', authenticateToken, authorizeRole(['admin', 'guard', 'secretary']), async (req, res) => {
    try {
        const { token } = req.params;
        const result = await pool.query('SELECT * FROM visitors WHERE qr_token = $1', [token]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid or unrecognized QR code' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

/**
 * @desc    Check-out a visitor
 * @access  Private (Admin or Guard)
 */
router.put('/check-out/:id', authenticateToken, authorizeRole(['admin', 'guard', 'secretary']), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `UPDATE visitors 
       SET status = 'checked_out', check_out_time = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Visitor not found' });
        }
        res.json({ message: 'Visitor checked out successfully', visitor: result.rows[0] });
    } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({ error: 'Failed to check out visitor' });
    }
});

/**
 * @desc    Approve a visitor
 * @access  Private (Admin or Secretary)
 */
router.put('/approve/:id', authenticateToken, authorizeRole(['admin', 'secretary']), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE visitors SET status = 'approved' WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Visitor not found' });
        }
        res.json({ message: 'Visitor approved successfully', visitor: result.rows[0] });
    } catch (error) {
        console.error('Approve visitor error:', error);
        res.status(500).json({ error: 'Failed to approve visitor' });
    }
});

/**
 * @desc    Reject a visitor
 * @access  Private (Admin or Secretary)
 */
router.put('/reject/:id', authenticateToken, authorizeRole(['admin', 'secretary']), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE visitors SET status = 'rejected' WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Visitor not found' });
        }
        res.json({ message: 'Visitor rejected successfully', visitor: result.rows[0] });
    } catch (error) {
        console.error('Reject visitor error:', error);
        res.status(500).json({ error: 'Failed to reject visitor' });
    }
});

/**
      * @desc    Delete a visitor record
      * @access  Private (Admin)
      */
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM visitors WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Visitor not found' });
        }

        res.json({ message: 'Visitor record deleted successfully' });
    } catch (error) {
        console.error('Delete visitor error:', error);
        res.status(500).json({ error: 'Failed to delete visitor record' });
    }
});

module.exports = router;

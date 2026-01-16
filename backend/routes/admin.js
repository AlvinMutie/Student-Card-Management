const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Setup a test parent account from existing imported data (Admin only)
router.post('/setup-test-parent', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const client = await pool.connect();
    const { adm } = req.body;
    try {
        await client.query('BEGIN');

        let parentQuery;
        let queryParams = [];

        if (adm) {
            parentQuery = `
                SELECT p.id, p.name, p.email, p.phone, COUNT(s.id) as student_count
                FROM parents p
                JOIN students s ON s.parent_id = p.id
                WHERE p.user_id IS NULL AND s.adm = $1
                GROUP BY p.id, p.name, p.email, p.phone
                LIMIT 1
            `;
            queryParams = [adm];
        } else {
            parentQuery = `
                SELECT p.id, p.name, p.email, p.phone, COUNT(s.id) as student_count
                FROM parents p
                JOIN students s ON s.parent_id = p.id
                WHERE p.user_id IS NULL
                GROUP BY p.id, p.name, p.email, p.phone
                HAVING COUNT(s.id) > 0
                LIMIT 1
            `;
        }

        const parentResult = await client.query(parentQuery, queryParams);

        if (parentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: adm ? `No suitable parent found for student ADM ${adm}.` : 'No suitable parent found in imported data.' });
        }

        const parent = parentResult.rows[0];
        // Ensure email exists for account creation
        const userEmail = parent.email || `${parent.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
        const defaultPassword = 'Parent123!';
        const passwordHash = await bcrypt.hash(defaultPassword, 10);

        // 2. Create user account
        const userResult = await client.query(
            "INSERT INTO users (full_name, email, phone, password, role, status) VALUES ($1, $2, $3, $4, 'parent', 'approved') RETURNING id",
            [parent.name, userEmail, parent.phone, passwordHash]
        );
        const userId = userResult.rows[0].id;

        // 3. Link parent to user (and update email if it was missing)
        await client.query(
            "UPDATE parents SET user_id = $1, email = $2 WHERE id = $3",
            [userId, userEmail, parent.id]
        );

        await client.query('COMMIT');

        res.json({
            message: 'Test parent account created successfully',
            credentials: {
                email: userEmail,
                password: defaultPassword
            },
            parentName: parent.name,
            studentsLinked: parent.student_count
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Setup test parent error:', error);
        res.status(500).json({ error: 'Failed to setup test parent account' });
    } finally {
        client.release();
    }
});

// Approve staff account
router.put('/approve-staff/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        await client.query('BEGIN');

        // 1. Update users table
        const userResult = await client.query(
            "UPDATE users SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND role NOT IN ('admin', 'parent') RETURNING id, full_name, email, role, status",
            [id]
        );

        if (userResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Staff account not found or cannot be approved' });
        }

        // 2. Update staff table (if entry exists)
        await client.query(
            "UPDATE staff SET approved = true WHERE user_id = $1",
            [id]
        );

        await client.query('COMMIT');

        res.json({
            message: 'Staff account approved successfully',
            user: userResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Approve staff error:', error);
        res.status(500).json({ error: 'Failed to approve staff account' });
    } finally {
        client.release();
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

// Get school settings
router.get('/school-settings', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM school_settings LIMIT 1");
        if (result.rows.length === 0) {
            // Return defaults if not set in DB
            return res.json({
                school_name: "ST. MARY'S ACADEMY",
                school_motto: "Excellence in Education",
                school_logo_url: "../favicon.ico",
                contact_phone_1: "0738 934 812",
                contact_phone_2: "0713 715 956"
            });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get school settings error:', error);
        res.status(500).json({ error: 'Failed to retrieve school settings' });
    }
});

// Update school settings (Admin only)
router.post('/school-settings', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { school_name, school_motto, school_logo_url, contact_phone_1, contact_phone_2, address } = req.body;
    try {
        const check = await pool.query("SELECT id FROM school_settings LIMIT 1");
        let result;
        if (check.rows.length === 0) {
            result = await pool.query(
                "INSERT INTO school_settings (school_name, school_motto, school_logo_url, contact_phone_1, contact_phone_2, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
                [school_name, school_motto, school_logo_url, contact_phone_1, contact_phone_2, address]
            );
        } else {
            result = await pool.query(
                "UPDATE school_settings SET school_name = $1, school_motto = $2, school_logo_url = $3, contact_phone_1 = $4, contact_phone_2 = $5, address = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *",
                [school_name, school_motto, school_logo_url, contact_phone_1, contact_phone_2, address, check.rows[0].id]
            );
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update school settings error:', error);
        res.status(500).json({ error: 'Failed to update school settings' });
    }
});

module.exports = router;

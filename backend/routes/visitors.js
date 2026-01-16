const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const crypto = require('crypto');

// Get all visitors (with optional filtering)
router.get('/debug-test', (req, res) => {
  res.json({ message: 'Visitors API is working', time: new Date().toISOString() });
});

router.get('/', authenticateToken, authorizeRole(['admin', 'guard', 'secretary']), async (req, res) => {
  try {
    const { status, search } = req.query;

    // Check which columns exist to be resilient to different migration states
    // But for now, we'll use a query that aliases common renames to match admin-lite.js expectations
    let query = `
      SELECT 
        v.id, 
        v.name, 
        v.id_number, 
        v.phone, 
        v.purpose, 
        v.status, 
        v.qr_token,
        v.created_at
    `;

    // Attempt to handle different schema versions via simple column selection
    // Note: We'll try to guess if we're on the "lite" schema or "full" schema
    // Most stable is to alias them to what the frontend expects

    // We'll use a trick: select both possible names and allow one to fail, 
    // OR just use the one from visitor_schema.sql which seems more recent.

    // Re-evaluating: The most likely schema on VPS has 'check_in', 'host', 'vehicle'
    query += `
        , v.check_in as check_in_time
        , v.check_out as check_out_time
        , v.host as host_name
        , v.vehicle as plate_number
      FROM visitors v
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND v.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      query += ` AND (v.name ILIKE $${paramCount} OR v.id_number ILIKE $${paramCount} OR v.phone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY v.check_in DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get visitors error:', error);

    // FALLBACK: If the above failed, try the old column names
    try {
      const fallbackQuery = `
            SELECT *, host_name as host, plate_number as vehicle, check_in_time as check_in 
            FROM visitors 
            ORDER BY check_in_time DESC
        `;
      const result = await pool.query(fallbackQuery);
      res.json(result.rows);
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Check-in new visitor
router.post('/check-in', async (req, res) => {
  try {
    const {
      name,
      id_number, idNumber, national_id, nationalId,
      phone, phoneNumber, phone_number, telephone,
      purpose,
      host, host_name, hostName, person_visited, personVisited,
      vehicle, vehicle_model, plate_number, plateNumber
    } = req.body;

    const finalIdNumber = id_number || idNumber || national_id || nationalId;
    const finalPhone = phone || phoneNumber || phone_number || telephone;
    const finalHost = host || host_name || hostName || person_visited || personVisited;
    const finalVehicle = vehicle || vehicle_model || plate_number || plateNumber;

    if (!name || !purpose) {
      return res.status(400).json({ error: 'Name and Purpose are required' });
    }

    const qr_token = crypto.randomBytes(16).toString('hex');

    // Robust INSERT: try new column names first
    try {
      const result = await pool.query(
        `INSERT INTO visitors (name, id_number, phone, vehicle, purpose, host, qr_token, status, check_in)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP)
             RETURNING id, name, id_number, phone, vehicle as plate_number, purpose, host as host_name, qr_token, status, check_in as check_in_time`,
        [name, finalIdNumber, finalPhone, finalVehicle, purpose, finalHost, qr_token]
      );
      res.status(201).json(result.rows[0]);
    } catch (insertError) {
      console.warn('Lite insert failed, trying legacy schema:', insertError.message);
      const result = await pool.query(
        `INSERT INTO visitors (name, id_number, phone, plate_number, purpose, host_name, qr_token, status, check_in_time)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP)
             RETURNING *`,
        [name, finalIdNumber, finalPhone, finalVehicle, purpose, finalHost, qr_token]
      );
      res.status(201).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check-out visitor
router.put('/check-out/:id', authenticateToken, authorizeRole(['admin', 'guard', 'secretary']), async (req, res) => {
  try {
    const { id } = req.params;

    // Try both check_out and check_out_time
    try {
      const result = await pool.query(
        "UPDATE visitors SET status = 'checked_out', check_out = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
        [id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Visitor not found' });
      res.json({ message: 'Visitor checked out successfully', visitor: result.rows[0] });
    } catch (updateError) {
      console.warn('Lite checkout failed, trying legacy:', updateError.message);
      const result = await pool.query(
        "UPDATE visitors SET status = 'checked_out', check_out_time = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
        [id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Visitor not found' });
      res.json({ message: 'Visitor checked out successfully', visitor: result.rows[0] });
    }
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve visitor
router.put('/approve/:id', authenticateToken, authorizeRole(['admin', 'secretary', 'guard', 'staff', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[DEBUG] Approving visitor ID: ${id} by user: ${req.user.email} (Role: ${req.user.role})`);

    const result = await pool.query(
      "UPDATE visitors SET status = 'approved' WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      console.warn(`[DEBUG] Visitor ID: ${id} not found for approval`);
      return res.status(404).json({ error: 'Visitor not found' });
    }
    res.json({ message: 'Visitor approved successfully', visitor: result.rows[0] });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject visitor
router.put('/reject/:id', authenticateToken, authorizeRole(['admin', 'secretary', 'guard', 'staff', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[DEBUG] Rejecting visitor ID: ${id} by user: ${req.user.email} (Role: ${req.user.role})`);

    const result = await pool.query(
      "UPDATE visitors SET status = 'rejected' WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      console.warn(`[DEBUG] Visitor ID: ${id} not found for rejection`);
      return res.status(404).json({ error: 'Visitor not found' });
    }
    res.json({ message: 'Visitor rejected successfully', visitor: result.rows[0] });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete record
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM visitors WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Visitor not found' });
    res.json({ message: 'Visitor record deleted successfully' });
  } catch (error) {
    console.error('Delete visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

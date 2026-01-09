const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const crypto = require('crypto');

// Get all visitors (with optional filtering)
router.get('/', authenticateToken, authorizeRole(['admin', 'guard', 'secretary']), async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT v.*, u.email as processed_by_email 
      FROM visitors v
      LEFT JOIN users u ON v.processed_by = u.id
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

    query += ' ORDER BY v.check_in_time DESC';

    const result = await pool.query(query, params);
    
    // Support both formats (array directly and {visitors: []})
    res.json({ visitors: result.rows, data: result.rows });
  } catch (error) {
    console.error('Get visitors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check-in new visitor
router.post('/check-in', async (req, res) => {
  try {
    const { 
      name, 
      nationalId, national_id, id_number, idNumber, // handle all cases
      telephone, phoneNumber, phone_number, phone, // handle all cases
      purpose, 
      personVisited, person_visited, host_name, hostName, // handle all cases
      vehicleModel, vehicle_model,
      plateNumber, plate_number
    } = req.body;

    // Normalize fields for the database
    const finalIdNumber = id_number || idNumber || national_id || nationalId;
    const finalPhone = phone || phoneNumber || telephone || phone_number;
    const finalHostName = host_name || hostName || person_visited || personVisited;
    const finalVehicleModel = vehicle_model || vehicleModel;
    const finalPlateNumber = plate_number || plateNumber;

    if (!name || !finalIdNumber || !finalPhone || !purpose || !finalHostName) {
      return res.status(400).json({ error: 'Missing required visitor fields', required: ['name', 'id_number', 'phone', 'purpose', 'host_name'] });
    }

    // Generate a unique token for the QR code
    const qr_token = crypto.randomBytes(16).toString('hex');

    const result = await pool.query(
      `INSERT INTO visitors (
        name, id_number, phone, purpose, host_name, 
        vehicle_model, plate_number, qr_token, status, check_in_time
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', CURRENT_TIMESTAMP)
       RETURNING *`,
      [name, finalIdNumber, finalPhone, purpose, finalHostName, finalVehicleModel, finalPlateNumber, qr_token]
    );

    res.status(201).json({ 
      message: 'Visitor checked in successfully',
      visitor: result.rows[0],
      ...result.rows[0] // for compatibility
    });
  } catch (error) {
    console.error('Check-in visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify visitor by token or ID
router.get('/verify/:token', authenticateToken, async (req, res) => {
  try {
    const { token } = req.params;
    
    // Try token first, then ID (for older compatibility)
    let result = await pool.query('SELECT * FROM visitors WHERE qr_token = $1', [token]);
    
    if (result.rows.length === 0 && !isNaN(token)) {
      result = await pool.query('SELECT * FROM visitors WHERE id = $1', [parseInt(token)]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or unrecognized QR code' });
    }

    res.json({ visitor: result.rows[0], ...result.rows[0] });
  } catch (error) {
    console.error('Verify visitor error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Approve visitor
router.put('/approve/:id', authenticateToken, authorizeRole(['admin', 'secretary']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE visitors 
       SET status = 'approved', processed_by = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    res.json({ message: 'Visitor approved successfully', visitor: result.rows[0] });
  } catch (error) {
    console.error('Approve visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject visitor
router.put('/reject/:id', authenticateToken, authorizeRole(['admin', 'secretary']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE visitors 
       SET status = 'rejected', processed_by = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    res.json({ message: 'Visitor rejected successfully', visitor: result.rows[0] });
  } catch (error) {
    console.error('Reject visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check-out visitor
router.put('/check-out/:id', authenticateToken, authorizeRole(['admin', 'guard', 'secretary']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE visitors 
       SET status = 'checked_out', check_out_time = CURRENT_TIMESTAMP, processed_by = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    res.json({ message: 'Visitor checked out successfully', visitor: result.rows[0] });
  } catch (error) {
    console.error('Check-out visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete record
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

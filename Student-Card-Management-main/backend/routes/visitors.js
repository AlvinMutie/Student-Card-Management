const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all visitors (with optional filtering)
router.get('/', authenticateToken, async (req, res) => {
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
      query += ` AND (v.name ILIKE $${paramCount} OR v.national_id ILIKE $${paramCount} OR v.phone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY v.check_in_time DESC';

    const result = await pool.query(query, params);
    
    // Wrap in expected format based on frontend
    res.json({ visitors: result.rows });
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
      nationalId, national_id, // handle both cases
      telephone, phoneNumber, phone_number, // handle all cases
      purpose, 
      personVisited, person_visited, // handle both cases
      vehicleModel, vehicle_model,
      plateNumber, plate_number
    } = req.body;

    // Normalize fields
    const finalNationalId = nationalId || national_id;
    const finalPhone = phoneNumber || telephone || phone_number;
    const finalPersonVisited = personVisited || person_visited;
    const finalVehicleModel = vehicleModel || vehicle_model;
    const finalPlateNumber = plateNumber || plate_number;

    if (!name || !finalNationalId || !finalPhone || !purpose || !finalPersonVisited) {
      return res.status(400).json({ error: 'Missing required visitor fields' });
    }

    const result = await pool.query(
      `INSERT INTO visitors (
        name, national_id, phone, purpose, person_visited, 
        vehicle_model, plate_number, status, check_in_time
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'waiting', CURRENT_TIMESTAMP)
       RETURNING *`,
      [name, finalNationalId, finalPhone, purpose, finalPersonVisited, finalVehicleModel, finalPlateNumber]
    );

    res.status(201).json({ 
      message: 'Visitor checked in successfully',
      visitor: result.rows[0]
    });
  } catch (error) {
    console.error('Check-in visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify QR Code
router.get('/verify/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM visitors WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    res.json({ visitor: result.rows[0] });
  } catch (error) {
    console.error('Verify visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve visitor
router.put('/approve/:id', authenticateToken, async (req, res) => {
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

    res.json({ visitor: result.rows[0] });
  } catch (error) {
    console.error('Approve visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject visitor
router.put('/reject/:id', authenticateToken, async (req, res) => {
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

    res.json({ visitor: result.rows[0] });
  } catch (error) {
    console.error('Reject visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check-out visitor
router.put('/check-out/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE visitors 
       SET status = 'checkedOut', check_out_time = CURRENT_TIMESTAMP, processed_by = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    res.json({ visitor: result.rows[0] });
  } catch (error) {
    console.error('Check-out visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

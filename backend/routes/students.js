const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/students');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize filename: use timestamp + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'student-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File Filter (Images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const normalizeKey = (key) => {
  if (!key && key !== 0) return '';
  return String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
};

const stringOrNull = (value) => {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str.length ? str : null;
};

const numberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const normalizeStudentPayload = (payload = {}) => {
  const normalized = {};

  Object.entries(payload).forEach(([key, value]) => {
    const normalizedKey = normalizeKey(key);
    if (normalizedKey) {
      normalized[normalizedKey] =
        typeof value === 'string' ? value.trim() : value;
    }
  });

  const getValue = (...aliases) => {
    for (const alias of aliases) {
      const normalizedAlias = normalizeKey(alias);
      if (
        normalizedAlias &&
        Object.prototype.hasOwnProperty.call(normalized, normalizedAlias)
      ) {
        return normalized[normalizedAlias];
      }
    }
    return undefined;
  };

  const toDateString = (value) => {
    const raw = stringOrNull(value);
    return raw || null;
  };

  const adm = stringOrNull(
    getValue('adm', 'admissionnumber', 'admission number', 'admissionno')
  );

  const name = stringOrNull(
    getValue('name', 'fullname', 'full name', 'studentname', 'student name')
  );

  return {
    adm,
    name,
    nemis: stringOrNull(getValue('nemis', 'upi', 'upinumber', 'upi number')),
    className: stringOrNull(
      getValue('class', 'classname', 'grade', 'kcpeclass')
    ),
    fee_balance: numberOrNull(
      getValue('fee_balance', 'fee balance', 'feebalance')
    ),
    parent_id: numberOrNull(getValue('parent_id', 'parentid')),
    photo_url: stringOrNull(getValue('photo_url', 'photourl', 'photo')),
    stream: stringOrNull(getValue('stream')),
    house: stringOrNull(getValue('house')),
    date_of_admission: toDateString(
      getValue('date_of_admission', 'admissiondate', 'dateadmitted')
    ),
    date_of_completion: toDateString(
      getValue('date_of_completion', 'completiondate', 'graduationdate')
    ),
    meal_card_validity: toDateString(
      getValue('meal_card_validity', 'mealcardvalidity', 'mealcardexpiry')
    ),
    contact: stringOrNull(
      getValue('contact', 'contacts', 'phone', 'phonenumber', 'guardiancontact')
    ),
    parent_name: stringOrNull(
      getValue('parent_name', 'parentname', 'guardianname', 'parent fullname')
    ),
    parent_email: stringOrNull(
      getValue('parent_email', 'parentemail', 'guardianemail')
    ),
    gender: stringOrNull(getValue('gender', 'sex')),
    kcpe_score: stringOrNull(
      getValue('kcpe', 'kcpegrade', 'kcpepoints', 'kcpe score', 'kcpe_score')
    ),
    importRowNumber:
      numberOrNull(
        getValue(
          'importrownumber',
          'rownumber',
          '__rownumber',
          'rowindex',
          'importrow'
        )
      ) || null,
  };
};

const ensureParentExistsById = async (parentId) => {
  const result = await pool.query('SELECT id FROM parents WHERE id = $1', [
    parentId,
  ]);
  if (result.rows.length === 0) {
    throw new Error(`Parent with ID ${parentId} was not found`);
  }
  return parentId;
};

const findParentByEmail = async (email) => {
  if (!email) return null;
  const result = await pool.query(
    'SELECT id FROM parents WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [email]
  );
  return result.rows.length ? result.rows[0].id : null;
};

const findParentByName = async (name) => {
  if (!name) return null;
  const result = await pool.query(
    'SELECT id FROM parents WHERE LOWER(name) = LOWER($1) LIMIT 1',
    [name.toLowerCase()]
  );
  return result.rows.length ? result.rows[0].id : null;
};

const createParentFromImport = async ({ parent_name, parent_email, contact }) => {
  if (!parent_email) {
    throw new Error(
      'Parent email is required to create a new parent profile automatically'
    );
  }

  try {
    const created = await pool.query(
      `INSERT INTO parents (name, email, phone)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [parent_name || parent_email, parent_email, contact || null]
    );
    return created.rows[0].id;
  } catch (error) {
    if (error.code === '23505') {
      // Unique violation - fetch the parent that races us
      const existing = await findParentByEmail(parent_email);
      if (existing) {
        return existing;
      }
    }
    throw error;
  }
};

const resolveParentReference = async ({
  parent_id,
  parent_name,
  parent_email,
  contact,
}) => {
  if (parent_id) {
    return ensureParentExistsById(parent_id);
  }

  if (parent_email) {
    const existingByEmail = await findParentByEmail(parent_email);
    if (existingByEmail) {
      return existingByEmail;
    }
    return createParentFromImport({ parent_name, parent_email, contact });
  }

  if (parent_name) {
    const existingByName = await findParentByName(parent_name);
    if (existingByName) {
      return existingByName;
    }
  }

  return null;
};

let studentColumnsEnsured = false;
const ensureStudentExtendedColumns = async () => {
  if (studentColumnsEnsured) return;
  try {
    await pool.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS contact VARCHAR(50),
      ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
      ADD COLUMN IF NOT EXISTS kcpe_score VARCHAR(50),
      ADD COLUMN IF NOT EXISTS stream VARCHAR(100),
      ADD COLUMN IF NOT EXISTS house VARCHAR(100),
      ADD COLUMN IF NOT EXISTS date_of_admission DATE,
      ADD COLUMN IF NOT EXISTS date_of_completion DATE,
      ADD COLUMN IF NOT EXISTS meal_card_validity DATE
    `);
    studentColumnsEnsured = true;
  } catch (error) {
    console.error('Failed to ensure student columns exist:', error);
    throw error;
  }
};

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

// QR Code Scan endpoint (Mobile App)
router.post('/scan-qr', authenticateToken, authorizeRole(['admin', 'staff', 'guard', 'teacher']), async (req, res) => {
  try {
    const { qrData, scannedBy } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data is required'
      });
    }

    // QR code might be a plain admission number or a legacy JSON string
    let admissionNumber = qrData.trim();

    // Check if it's JSON (legacy format)
    if (qrData.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(qrData);
        if (parsed.adm) {
          admissionNumber = parsed.adm;
        }
      } catch (e) {
        // Not valid JSON, treat as plain text
      }
    }

    // Fetch student details from database
    const result = await pool.query(
      `SELECT s.*, p.name as parent_name, p.phone as parent_phone, p.email as parent_email
       FROM students s
       LEFT JOIN parents p ON s.parent_id = p.id
       WHERE s.adm = $1`,
      [admissionNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found. Invalid QR code.'
      });
    }

    const student = result.rows[0];

    // Log the scan event (optional - you can add a scans table later if needed)
    console.log(`QR Scan: Student ${student.name} (${student.adm}) scanned by user ${scannedBy}`);

    // Return student data in the format expected by mobile app
    res.json({
      success: true,
      message: 'Student verified successfully',
      student: {
        id: student.id,
        studentId: student.adm,
        name: student.name,
        grade: student.class,
        nemis: student.nemis,
        photoUrl: student.photo_url,
        parentName: student.parent_name,
        parentPhone: student.parent_phone,
        parentEmail: student.parent_email,
        feeBalance: student.fee_balance,
        stream: student.stream,
        house: student.house,
        contact: student.contact
      }
    });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during QR scan'
    });
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

    const updatedStudent = result.rows[0];
    res.json({
      success: true,
      message: `Student ${updatedStudent.name || updatedStudent.adm} updated successfully`,
      ...updatedStudent,
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get students for parent (parent's children)
router.get('/parent/my-students', authenticateToken, authorizeRole('parent'), async (req, res) => {
  try {
    const userId = req.user.id;
    let parentId = req.user.profileRecordId;

    if (!parentId) {
      // Fallback: Get parent_id from user_id if not in token/middleware cache
      const parentResult = await pool.query(
        'SELECT id FROM parents WHERE user_id = $1',
        [userId]
      );
      if (parentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Parent not found' });
      }
      parentId = parentResult.rows[0].id;
    }

    // Get all students for this parent
    console.log(`[DEBUG] Fetching students for Parent ID: ${parentId} (User ID: ${userId})`);
    const result = await pool.query(
      `SELECT s.*, p.name as parent_name, p.email as parent_email, p.phone as parent_phone
       FROM students s
       LEFT JOIN parents p ON s.parent_id = p.id
       WHERE s.parent_id = $1
       ORDER BY s.created_at DESC`,
      [parentId]
    );

    console.log(`[DEBUG] Found ${result.rows.length} students for Parent ID: ${parentId}`);

    res.json(result.rows);
  } catch (error) {
    console.error(`[ERROR] Get parent students error for Parent ID ${parentId}:`, error);
    res.status(500).json({ error: 'Failed to retrieve linked students', details: error.message });
  }
});

// Create student (admin only)
router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  let normalized = {};
  try {
    await ensureStudentExtendedColumns();
    normalized = normalizeStudentPayload(req.body);
    const {
      adm,
      name,
      nemis,
      className,
      fee_balance,
      parent_id,
      photo_url,
      stream,
      house,
      date_of_admission,
      date_of_completion,
      meal_card_validity,
      contact,
      parent_name,
      parent_email,
      gender,
      kcpe_score,
      importRowNumber,
    } = normalized;

    if (!adm || !name) {
      return res
        .status(400)
        .json({ error: 'Admission number and name are required' });
    }

    let resolvedParentId = null;
    try {
      resolvedParentId = await resolveParentReference({
        parent_id,
        parent_name,
        parent_email,
        contact,
      });
    } catch (parentError) {
      return res.status(400).json({ error: parentError.message });
    }

    const sanitizedFeeBalance =
      typeof fee_balance === 'number' && Number.isFinite(fee_balance)
        ? fee_balance
        : Number.isFinite(Number(fee_balance))
          ? Number(fee_balance)
          : 0;

    const result = await pool.query(
      `INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id, photo_url, 
                             stream, house, date_of_admission, date_of_completion, meal_card_validity,
                             contact, parent_name, parent_email, gender, kcpe_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        adm,
        name,
        nemis || null,
        className || null,
        sanitizedFeeBalance,
        resolvedParentId,
        photo_url || null,
        stream || null,
        house || null,
        date_of_admission || null,
        date_of_completion || null,
        meal_card_validity || null,
        contact || null,
        parent_name || null,
        parent_email || null,
        gender || null,
        kcpe_score || null,
      ]
    );

    const createdStudent = result.rows[0];
    res.status(201).json({
      success: true,
      message: `Student ${createdStudent.name || adm} created successfully`,
      ...createdStudent,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'Student with this admission number already exists',
      });
    }
    const rowInfo =
      normalized.importRowNumber ||
      req.body?.importRowNumber ||
      req.body?.rowNumber;
    console.error(
      `Create student error${rowInfo ? ` (row ${rowInfo})` : ''}:`,
      error
    );
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unexpected database error',
    });
  }
});

// Update student (admin only)
router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  let normalized = {};
  try {
    await ensureStudentExtendedColumns();
    const { id } = req.params;
    const identifierIsNumeric = /^\d+$/.test(id);
    const identifierColumn = identifierIsNumeric ? 'id' : 'adm';
    const identifierValue = id;

    normalized = normalizeStudentPayload(req.body);
    const {
      adm,
      name,
      nemis,
      className,
      fee_balance,
      parent_id,
      photo_url,
      stream,
      house,
      date_of_admission,
      date_of_completion,
      meal_card_validity,
      contact,
      parent_name,
      parent_email,
      gender,
      kcpe_score,
    } = normalized;

    let resolvedParentId = null;
    try {
      resolvedParentId = await resolveParentReference({
        parent_id,
        parent_name,
        parent_email,
        contact,
      });
    } catch (parentError) {
      return res.status(400).json({ error: parentError.message });
    }

    const result = await pool.query(
      `UPDATE students
       SET adm = COALESCE($1, adm),
           name = COALESCE($2, name),
           nemis = COALESCE($3, nemis),
           class = COALESCE($4, class),
           fee_balance = COALESCE($5, fee_balance),
           parent_id = COALESCE($6, parent_id),
           photo_url = COALESCE($7, photo_url),
           stream = COALESCE($8, stream),
           house = COALESCE($9, house),
           date_of_admission = COALESCE($10, date_of_admission),
           date_of_completion = COALESCE($11, date_of_completion),
           meal_card_validity = COALESCE($12, meal_card_validity),
           contact = COALESCE($13, contact),
           parent_name = COALESCE($14, parent_name),
           parent_email = COALESCE($15, parent_email),
           gender = COALESCE($16, gender),
           kcpe_score = COALESCE($17, kcpe_score),
           updated_at = CURRENT_TIMESTAMP
       WHERE ${identifierColumn} = $18
       RETURNING *`,
      [
        adm,
        name,
        nemis,
        className,
        fee_balance,
        resolvedParentId,
        photo_url,
        stream,
        house,
        date_of_admission,
        date_of_completion,
        meal_card_validity,
        contact,
        parent_name,
        parent_email,
        gender,
        kcpe_score,
        identifierValue,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    const rowInfo =
      normalized.importRowNumber ||
      req.body?.importRowNumber ||
      req.body?.rowNumber;
    console.error(
      `Update student error${rowInfo ? ` (row ${rowInfo})` : ''}:`,
      error
    );
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unexpected database error',
    });
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

// Delete all students (admin only)
router.delete('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM students');
    res.json({ message: `All students deleted successfully. Removed ${result.rowCount} records.` });
  } catch (error) {
    console.error('Delete all students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload student photo
router.post('/:id/photo', authenticateToken, authorizeRole('admin'), upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    // Determine if id is numeric (database ID) or alphanumeric (admission number)
    const identifierIsNumeric = /^\d+$/.test(id);
    const identifierColumn = identifierIsNumeric ? 'id' : 'adm';

    // The photo_url should be accessible via the static file middleware
    const photoUrl = `/uploads/students/${req.file.filename}`;

    const result = await pool.query(
      `UPDATE students 
       SET photo_url = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE ${identifierColumn} = $2 
       RETURNING *`,
      [photoUrl, id]
    );

    if (result.rows.length === 0) {
      // If we failed to update, delete the uploaded file to keep system clean
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photo_url: photoUrl,
      student: result.rows[0]
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;


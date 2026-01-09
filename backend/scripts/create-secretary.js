
const pool = require('../config/database');
const bcrypt = require('bcrypt');

async function createSecretary() {
    const email = 'secretary@shuleniadvantage.com';
    const password = 'secretary123';
    const fullName = 'School Secretary';
    const role = 'secretary';
    const status = 'approved';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (full_name, email, password, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE 
       SET full_name = EXCLUDED.full_name, 
           password = EXCLUDED.password, 
           role = EXCLUDED.role, 
           status = EXCLUDED.status
       RETURNING id, email, role`,
            [fullName, email, hashedPassword, role, status]
        );
        console.log('✅ Secretary account created/updated:', result.rows[0]);
    } catch (err) {
        console.error('❌ Failed to create secretary account:', err.message);
    } finally {
        process.exit();
    }
}

createSecretary();

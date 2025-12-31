const pool = require('../config/database');
const bcrypt = require('bcrypt');

async function setup() {
    console.log('🚀 Starting Production Database Setup...');

    try {
        // 1. Add/Verify Columns
        console.log('📡 Updating users table schema...');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'`);

        try {
            await pool.query(`ALTER TABLE users RENAME COLUMN password_hash TO password`);
            console.log('✅ Renamed password_hash to password');
        } catch (e) {
            if (e.code === '42703') { // Column does not exist (already renamed)
                console.log('ℹ️ password_hash already renamed or does not exist');
            } else if (e.code === '42701') { // Column "password" already exists
                console.log('ℹ️ password column already exists');
            } else {
                throw e;
            }
        }

        await pool.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`);
        await pool.query(`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'parent', 'staff', 'teacher', 'kitchen', 'accountant', 'guard', 'other'))`);

        // 2. Clear out any "broken" tests that might block registration
        console.log('🧹 Cleaning up old test data...');
        await pool.query("DELETE FROM users WHERE email IN ('admin@example.com', 'parent@example.com', 'kyaloalvin@hechlink.edu')");

        // 3. Create fresh, functional users
        console.log('👤 Creating production-ready users...');
        const adminHash = await bcrypt.hash('admin123', 10);
        const parentHash = await bcrypt.hash('parent123', 10);

        // Insert Admin
        await pool.query(
            "INSERT INTO users (full_name, email, password, role, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, status = EXCLUDED.status, full_name = EXCLUDED.full_name",
            ['System Administrator', 'admin@example.com', adminHash, 'admin', 'approved']
        );

        // Insert Parent
        await pool.query(
            "INSERT INTO users (full_name, email, password, role, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, status = EXCLUDED.status, full_name = EXCLUDED.full_name",
            ['Sarah Onyango', 'parent@example.com', parentHash, 'parent', 'approved']
        );

        console.log('✅ Database setup complete!');
        console.log('--------------------------------------------------');
        console.log('Credentials Approved:');
        console.log('- Admin: admin@example.com / admin123');
        console.log('- Parent: parent@example.com / parent123');
        console.log('--------------------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

setup();

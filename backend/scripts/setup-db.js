const pool = require('../config/database');
const bcrypt = require('bcrypt');

async function setup() {
    console.log('🚀 Starting Production Database Setup...');

    try {
        // 1. Add/Verify Columns
        console.log('📡 Updating users table schema...');

        // Ensure columns exist first (without constraints)
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255)`);

        // Handle the password_hash -> password migration safely
        await pool.query(`
            DO $$ 
            BEGIN 
                -- If we have password_hash, migrate its data to 'password' if 'password' is null
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
                    UPDATE users SET password = password_hash WHERE password IS NULL;
                    -- Now we can safely drop it
                    ALTER TABLE users DROP COLUMN password_hash CASCADE;
                END IF;
            END $$;
        `);

        // CRITICAL FIX: Fill any remaining NULL passwords before setting NOT NULL
        // This prevents the "column contains null values" error
        const fallbackHash = await bcrypt.hash('ResetMe123!', 10);
        await pool.query('UPDATE users SET password = $1 WHERE password IS NULL', [fallbackHash]);

        // Now safe to set NOT NULL
        await pool.query(`ALTER TABLE users ALTER COLUMN password SET NOT NULL`);

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

        // 4. Create Demo Parent for Client Presentation
        console.log('📡 Seeding demo parent data...');
        const demoHash = await bcrypt.hash('demo123', 10);
        const demoParent = await pool.query(`
            INSERT INTO users (full_name, email, phone, password, role, status)
            VALUES ('Demo Parent', 'demo@example.com', '0700000000', $1, 'parent', 'approved')
            ON CONFLICT (email) DO UPDATE 
            SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, status = EXCLUDED.status, password = EXCLUDED.password
            RETURNING id
        `, [demoHash]);

        // Ensure a sample student exists to link to
        await pool.query(`
            INSERT INTO students (adm, name, class, stream, fee_balance, parent_email)
            VALUES ('ST001', 'Sample Student (Demo)', 'Grade 4', 'North', 15000.00, 'demo@example.com')
            ON CONFLICT (adm) DO NOTHING
        `);

        console.log('✅ Database setup complete! Demo account: demo@example.com / demo123');
    } catch (err) {
        console.error('❌ Setup failed:', err);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

setup();

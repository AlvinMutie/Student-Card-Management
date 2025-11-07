// Script to update password hashes in the database
const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'student_card_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function updatePasswords() {
  try {
    console.log('Updating password hashes...\n');

    // Generate hashes
    const adminHash = await bcrypt.hash('admin123', 10);
    const parentHash = await bcrypt.hash('parent123', 10);

    console.log('Generated hashes:');
    console.log('Admin:', adminHash);
    console.log('Parent:', parentHash);
    console.log('\nUpdating database...\n');

    // Update or insert admin user
    await pool.query(`
      INSERT INTO users (email, password_hash, role) 
      VALUES ($1, $2, $3)
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = EXCLUDED.password_hash
    `, ['admin@example.com', adminHash, 'admin']);

    console.log('✓ Admin user updated');

    // Update or insert parent user
    await pool.query(`
      INSERT INTO users (email, password_hash, role) 
      VALUES ($1, $2, $3)
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = EXCLUDED.password_hash
    `, ['parent@example.com', parentHash, 'parent']);

    console.log('✓ Parent user updated');

    // Get parent user_id and create parent/student records
    const parentUserResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['parent@example.com']
    );

    if (parentUserResult.rows.length > 0) {
      const parentUserId = parentUserResult.rows[0].id;

      // Insert or update parent record
      const parentResult = await pool.query(`
        INSERT INTO parents (user_id, name, email, phone) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) 
        DO UPDATE SET user_id = EXCLUDED.user_id
        RETURNING id
      `, [parentUserId, 'Sarah Onyango', 'parent@example.com', '+254712345678']);

      if (parentResult.rows.length > 0) {
        const parentId = parentResult.rows[0].id;

        // Insert student record
        await pool.query(`
          INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) 
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (adm) DO NOTHING
        `, ['ST3507', 'Emma Onyango', 'NEMIS-7894561230', 'Grade 7 - Blue Section', 15000.00, parentId]);

        console.log('✓ Parent and student records created');
      }
    }

    console.log('\n✅ Password update complete!');
    console.log('\nTest credentials:');
    console.log('  Admin:  admin@example.com / admin123');
    console.log('  Parent: parent@example.com / parent123');

  } catch (error) {
    console.error('Error updating passwords:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updatePasswords();


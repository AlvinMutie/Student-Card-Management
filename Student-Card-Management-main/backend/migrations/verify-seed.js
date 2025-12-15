// Verify seed data was loaded correctly
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'student_card_management',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

async function verifySeed() {
  try {
    console.log('Verifying seed data...\n');
    
    // Check users
    const usersResult = await pool.query('SELECT email, role FROM users ORDER BY role, email');
    console.log('=== USERS ===');
    console.log(`Total users: ${usersResult.rows.length}`);
    usersResult.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    // Check parents
    const parentsResult = await pool.query('SELECT name, email FROM parents ORDER BY name');
    console.log('\n=== PARENTS ===');
    console.log(`Total parents: ${parentsResult.rows.length}`);
    parentsResult.rows.forEach(parent => {
      console.log(`  - ${parent.name} (${parent.email})`);
    });
    
    // Check students
    const studentsResult = await pool.query(`
      SELECT s.name, s.adm, s.class, p.name as parent_name
      FROM students s
      LEFT JOIN parents p ON s.parent_id = p.id
      ORDER BY p.name, s.name
    `);
    console.log('\n=== STUDENTS ===');
    console.log(`Total students: ${studentsResult.rows.length}`);
    studentsResult.rows.forEach(student => {
      console.log(`  - ${student.name} (${student.adm}) - ${student.class} - Parent: ${student.parent_name}`);
    });
    
    // Check staff
    const staffResult = await pool.query('SELECT name, email, department FROM staff ORDER BY name');
    console.log('\n=== STAFF ===');
    console.log(`Total staff: ${staffResult.rows.length}`);
    staffResult.rows.forEach(staff => {
      console.log(`  - ${staff.name} (${staff.email}) - ${staff.department}`);
    });
    
    // Check parent-student relationships
    const relationshipResult = await pool.query(`
      SELECT p.name as parent, COUNT(s.id) as student_count
      FROM parents p
      LEFT JOIN students s ON s.parent_id = p.id
      GROUP BY p.id, p.name
      ORDER BY student_count DESC, p.name
    `);
    console.log('\n=== PARENT-STUDENT RELATIONSHIPS ===');
    relationshipResult.rows.forEach(rel => {
      console.log(`  - ${rel.parent}: ${rel.student_count} student(s)`);
    });
    
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error verifying seed data:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifySeed();


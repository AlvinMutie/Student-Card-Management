// Check if backend setup is complete
const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function checkSetup() {
  console.log('========================================');
  console.log('Backend Setup Check');
  console.log('========================================\n');
  
  let allGood = true;
  
  // Check .env file
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    console.log('   Creating .env file from .env.example...');
    if (fs.existsSync(path.join(__dirname, '.env.example'))) {
      fs.copyFileSync(path.join(__dirname, '.env.example'), envPath);
      console.log('   ✅ Created .env file');
      console.log('   ⚠️  Please update .env with your database credentials\n');
    } else {
      console.log('   ❌ .env.example not found\n');
      allGood = false;
    }
  } else {
    console.log('✅ .env file exists');
  }
  
  // Check node_modules
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('❌ node_modules not found');
    console.log('   Run: npm install\n');
    allGood = false;
  } else {
    console.log('✅ Dependencies installed');
  }
  
  // Check database connection
  console.log('\nChecking database connection...');
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'student_card_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });
  
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    console.log(`✅ Database tables exist (${tablesResult.rows.length} tables)`);
    
    // Check if data exists
    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const parentsCount = await pool.query('SELECT COUNT(*) as count FROM parents');
    const studentsCount = await pool.query('SELECT COUNT(*) as count FROM students');
    const staffCount = await pool.query('SELECT COUNT(*) as count FROM staff');
    
    console.log('\n📊 Current Data:');
    console.log(`   Users: ${usersCount.rows[0].count}`);
    console.log(`   Parents: ${parentsCount.rows[0].count}`);
    console.log(`   Students: ${studentsCount.rows[0].count}`);
    console.log(`   Staff: ${staffCount.rows[0].count}`);
    
    if (usersCount.rows[0].count === '0') {
      console.log('\n⚠️  No users found in database');
      console.log('   Run: psql -d student_card_management -f migrations/clean-seed.sql');
    }
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('\nPlease check:');
    console.log('1. PostgreSQL is running');
    console.log('2. Database exists: ' + (process.env.DB_NAME || 'student_card_management'));
    console.log('3. Database credentials in .env are correct');
    allGood = false;
  } finally {
    await pool.end();
  }
  
  console.log('\n========================================');
  if (allGood) {
    console.log('✅ Setup check complete!');
    console.log('\nTo start the server:');
    console.log('  npm start');
    console.log('  or');
    console.log('  ./start-server.sh');
  } else {
    console.log('❌ Setup issues found. Please fix them above.');
  }
  console.log('========================================\n');
  
  process.exit(allGood ? 0 : 1);
}

checkSetup().catch(console.error);


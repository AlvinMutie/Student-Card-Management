const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'create-visitors-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration: create-visitors-table.sql');
    await pool.query(sql);
    console.log('Migration successful!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

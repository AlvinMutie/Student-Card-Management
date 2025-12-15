// Generate bcrypt hashes for all user types
const bcrypt = require('bcrypt');

async function generateAllHashes() {
  console.log('Generating bcrypt hashes for all user types...\n');
  
  const adminHash = await bcrypt.hash('admin123', 10);
  const parentHash = await bcrypt.hash('parent123', 10);
  const staffHash = await bcrypt.hash('staff123', 10);
  
  console.log('=== COPY THESE HASHES TO test-data.sql ===\n');
  console.log('Admin password hash (for admin123):');
  console.log(adminHash);
  console.log('\nParent password hash (for parent123):');
  console.log(parentHash);
  console.log('\nStaff password hash (for staff123):');
  console.log(staffHash);
  console.log('\n=== INSTRUCTIONS ===');
  console.log('1. Copy the admin hash and replace $2b$10$YOUR_ADMIN_HASH_HERE in test-data.sql');
  console.log('2. Copy the parent hash and replace $2b$10$YOUR_PARENT_HASH_HERE in test-data.sql');
  console.log('3. Copy the staff hash and replace $2b$10$YOUR_STAFF_HASH_HERE in test-data.sql');
  console.log('4. Run: psql -d student_card_management -f migrations/test-data.sql');
}

generateAllHashes().catch(console.error);


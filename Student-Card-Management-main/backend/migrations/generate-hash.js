// Helper script to generate bcrypt hashes for seed data
const bcrypt = require('bcrypt');

async function generateHashes() {
  console.log('Generating bcrypt hashes...\n');
  
  const adminHash = await bcrypt.hash('admin123', 10);
  const parentHash = await bcrypt.hash('parent123', 10);
  
  console.log('Admin password hash (for admin@example.com):');
  console.log(adminHash);
  console.log('\nParent password hash (for parent@example.com):');
  console.log(parentHash);
  console.log('\nUpdate migrations/seed.sql with these hashes.');
}

generateHashes().catch(console.error);


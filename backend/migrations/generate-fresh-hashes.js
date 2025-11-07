// Generate fresh bcrypt hashes for clean seed data
const bcrypt = require('bcrypt');

async function generateFreshHashes() {
  console.log('Generating fresh bcrypt hashes...\n');
  
  try {
    // Generate hashes for all passwords
    const adminHash = await bcrypt.hash('admin123', 10);
    const parentHash = await bcrypt.hash('parent123', 10);
    const staffHash = await bcrypt.hash('staff123', 10);
    
    console.log('========================================');
    console.log('COPY THESE HASHES TO clean-seed.sql');
    console.log('========================================\n');
    console.log('Admin hash (for admin123):');
    console.log(adminHash);
    console.log('\nParent hash (for parent123):');
    console.log(parentHash);
    console.log('\nStaff hash (for staff123):');
    console.log(staffHash);
    console.log('\n========================================');
    console.log('Instructions:');
    console.log('1. Replace the hash values in clean-seed.sql');
    console.log('2. Run: psql -d student_card_management -f migrations/clean-seed.sql');
    console.log('========================================\n');
    
    // Also write to a file for easy copy-paste
    const fs = require('fs');
    const output = `-- Generated password hashes
-- Admin (admin123): ${adminHash}
-- Parent (parent123): ${parentHash}
-- Staff (staff123): ${staffHash}
`;
    fs.writeFileSync('migrations/generated-hashes.txt', output);
    console.log('Hashes also saved to migrations/generated-hashes.txt\n');
    
  } catch (error) {
    console.error('Error generating hashes:', error);
    process.exit(1);
  }
}

generateFreshHashes();


const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function linkParents() {
    try {
        console.log('Connecting to database...');
        // Find up to 3 parents without user_id
        const res = await pool.query('SELECT * FROM parents WHERE user_id IS NULL LIMIT 3');
        const parents = res.rows;

        if (parents.length === 0) {
            console.log('No unlinked parents found.');
            return;
        }

        console.log(`Found ${parents.length} unlinked parents. Creating user accounts...`);

        for (const p of parents) {
            const passwordHash = await bcrypt.hash('password123', 10);

            try {
                // Create user
                const userRes = await pool.query(
                    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
                    [p.email, passwordHash, 'parent']
                );
                const userId = userRes.rows[0].id;

                // Link parent
                await pool.query('UPDATE parents SET user_id = $1 WHERE id = $2', [userId, p.id]);

                console.log(`Linked Parent: ${p.name} | Email: ${p.email} | Password: password123`);
            } catch (err) {
                if (err.code === '23505') { // Unique violation (email exists)
                    console.log(`User already exists for email ${p.email}, trying to find and link...`);
                    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [p.email]);
                    if (existing.rows.length) {
                        await pool.query('UPDATE parents SET user_id = $1 WHERE id = $2', [existing.rows[0].id, p.id]);
                        console.log(`> Linked existing user to parent ${p.name}`);
                    }
                } else {
                    console.error(`Failed to link ${p.name}:`, err.message);
                }
            }
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

linkParents();

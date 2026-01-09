const pool = require('./config/database');

async function check() {
    try {
        console.log('--- Parents with linked students ---');
        const parentsResult = await pool.query(`
      SELECT p.id, p.name, p.email, p.user_id, COUNT(s.id) as student_count 
      FROM parents p 
      LEFT JOIN students s ON s.parent_id = p.id 
      GROUP BY p.id, p.name, p.email, p.user_id
      HAVING COUNT(s.id) > 0 
      LIMIT 10
    `);
        console.table(parentsResult.rows);

        console.log('\n--- Users with parent role ---');
        const usersResult = await pool.query(`
      SELECT id, full_name, email, role, status FROM users WHERE role = 'parent' LIMIT 10
    `);
        console.table(usersResult.rows);

        if (usersResult.rows.length > 0) {
            const uId = usersResult.rows[0].id;
            console.log(`\n--- Checking students for user_id ${uId} ---`);
            const pDetail = await pool.query('SELECT id FROM parents WHERE user_id = $1', [uId]);
            if (pDetail.rows.length > 0) {
                const pId = pDetail.rows[0].id;
                const sDetail = await pool.query('SELECT id, name, adm, parent_id FROM students WHERE parent_id = $1', [pId]);
                console.log(`Found ${sDetail.rows.length} students for parent_id ${pId}`);
                console.table(sDetail.rows);
            } else {
                console.log('No parent record found for this user_id');
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

check();

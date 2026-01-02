const pool = require('./config/database');
const bcrypt = require('bcrypt');

async function setupSpecificParent() {
    try {
        const adm = '2514175'; // Augustine Wanjala
        const parentName = 'James Otieno';
        const email = 'james.otieno@example.com';
        const password = 'Parent123!';

        console.log(`Searching for student with ADM: ${adm}...`);
        const studentRes = await pool.query('SELECT * FROM students WHERE adm = $1', [adm]);

        if (studentRes.rows.length === 0) {
            console.log('Student not found in DB.');
            return;
        }

        const student = studentRes.rows[0];
        console.log(`Found student: ${student.name}, Parent ID: ${student.parent_id}`);

        if (!student.parent_id) {
            console.log('Student has no parent_id linked.');
            return;
        }

        const parentRes = await pool.query('SELECT * FROM parents WHERE id = $1', [student.parent_id]);
        if (parentRes.rows.length === 0) {
            console.log('Parent record not found.');
            return;
        }

        const parent = parentRes.rows[0];
        console.log(`Found parent record: ${parent.name}, User ID: ${parent.user_id}`);

        if (parent.user_id) {
            const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [parent.user_id]);
            console.log(`Parent already has a user account: ${userRes.rows[0]?.email}`);
            return;
        }

        // Create user
        const hashed = await bcrypt.hash(password, 10);
        const newUserRes = await pool.query(
            "INSERT INTO users (full_name, email, role, password, status) VALUES ($1, $2, 'parent', $3, 'approved') RETURNING id",
            [parent.name, email, hashed]
        );
        const newUserId = newUserRes.rows[0].id;

        // Link parent
        await pool.query('UPDATE parents SET user_id = $1, email = $2 WHERE id = $3', [newUserId, email, parent.id]);

        console.log('SUCCESS!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

setupSpecificParent();

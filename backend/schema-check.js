const pool = require('./config/database');

async function checkSchema() {
    try {
        const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'students'
    `);
        console.log('--- Students Table Schema ---');
        console.table(res.rows);

        const sample = await pool.query('SELECT * FROM students LIMIT 1');
        console.log('\n--- Sample Student Record ---');
        console.log(sample.rows[0]);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkSchema();

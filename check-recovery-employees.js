import pkg from 'pg';
const { Pool } = pkg;

const recoveryConnectionString = 'postgresql://neondb_owner:npg_b3FTnjuqoxH1@ep-restless-bush-ad0fzat2-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function checkRecoveryData() {
  const pool = new Pool({
    connectionString: recoveryConnectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Check all employees
    const employees = await pool.query('SELECT * FROM "Employee" ORDER BY id');
    console.log(`\n📊 Found ${employees.rows.length} employees in recovery branch:\n`);
    
    employees.rows.forEach(emp => {
      console.log(`   ID: ${emp.id}`);
      console.log(`   Name: ${emp.name || 'N/A'}`);
      console.log(`   Department: ${emp.department || 'N/A'}`);
      console.log(`   Role: ${emp.role || 'N/A'}`);
      console.log(`   PIN: ${emp.pin || 'N/A'}`);
      if (emp.state) {
        console.log(`   Has state: YES (${JSON.stringify(emp.state).length} chars)`);
      } else {
        console.log(`   Has state: NO`);
      }
      console.log('');
    });

    // Check time logs count
    const timeLogCount = await pool.query('SELECT COUNT(*) as count FROM "TimeLog"');
    console.log(`\n⏰ Time Logs: ${timeLogCount.rows[0].count}`);

    // Check shifts count  
    const shiftCount = await pool.query('SELECT COUNT(*) as count FROM "Shift"');
    console.log(`📅 Shifts: ${shiftCount.rows[0].count}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkRecoveryData();

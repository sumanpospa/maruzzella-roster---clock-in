import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

// Recovery branch connection string
const recoveryConnectionString = 'postgresql://neondb_owner:npg_b3FTnjuqoxH1@ep-restless-bush-ad0fzat2-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function extractRecoveryData() {
  const pool = new Pool({
    connectionString: recoveryConnectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔍 Connecting to recovery branch...\n');
    
    // First check what tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tables in recovery branch:');
    tablesResult.rows.forEach(row => console.log(`   - ${row.table_name}`));
    console.log('');
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found in recovery branch! This branch may be empty.');
      return;
    }
    
    // Check the actual schema of TimeLog table
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'TimeLog' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 TimeLog table columns:');
    columnsResult.rows.forEach(row => console.log(`   - ${row.column_name} (${row.data_type})`));
    console.log('');
    
    // Check if this is the old schema (Prisma) or new schema (JSON state)
    // Try to get time logs directly from TimeLog table first
    try {
      const timeLogsResult = await pool.query('SELECT * FROM "TimeLog" ORDER BY id DESC LIMIT 50');
      
      if (timeLogsResult.rows.length > 0) {
        console.log(`📊 Found ${timeLogsResult.rows.length} time logs in recovery branch!\n`);
        console.log('⏰ Sample Time Logs:\n');
        
        // Show first few to see the structure
        timeLogsResult.rows.slice(0, 10).forEach(log => {
          console.log(`   Log ID: ${log.id}`);
          Object.keys(log).forEach(key => {
            console.log(`      ${key}: ${log[key]}`);
          });
          console.log('');
        });
        
        // Save to file
        const filename = `recovery-timelogs-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.json`;
        fs.writeFileSync(filename, JSON.stringify(timeLogsResult.rows, null, 2));
        console.log(`💾 All time logs saved to: ${filename}`);
        return;
      } else {
        console.log('⚠️  No time logs found in TimeLog table.');
      }
    } catch (err) {
      console.log('⚠️  Could not query TimeLog table:', err.message);
    }
    
    // Fall back to trying Employee table with state JSON
    console.log('\nChecking for JSON state in Employee table...\n');
    
    // Fall back to trying Employee table with state JSON
    console.log('\nChecking for JSON state in Employee table...\n');
    
    // Get the state data
    try {
      const result = await pool.query(
        'SELECT * FROM "Employee" WHERE id = 999999'
      );

      if (result.rows.length === 0) {
        console.log('❌ No state data found (Employee ID 999999)!');
        
        // Check if there are any employees at all
        const allEmployees = await pool.query('SELECT COUNT(*) as count FROM "Employee"');
        console.log(`   Total employees in table: ${allEmployees.rows[0].count}`);
        
        console.log('\n⚠️  Recovery branch has old Prisma schema with no data.');
        console.log('   Try creating a branch from an earlier date (Nov 30, 29, or 28).');
        return;
      }

      const state = result.rows[0].state;
      
      if (!state || typeof state !== 'object') {
        console.log('❌ State field exists but is not valid JSON!');
        console.log('   State value:', state);
        return;
      }
      
      console.log('📊 Recovery branch data summary:');
      console.log(`   - Employees: ${state.employees?.length || 0}`);
      console.log(`   - Current Week Shifts: ${state.rosters?.thisWeek?.length || 0}`);
      console.log(`   - Next Week Shifts: ${state.rosters?.nextWeek?.length || 0}`);
      console.log(`   - Time Logs: ${state.timeLogs?.length || 0}\n`);

      if (state.timeLogs && state.timeLogs.length > 0) {
      console.log('⏰ Time Logs in recovery branch:\n');
      
      // Sort by clock in time
      const sortedLogs = [...state.timeLogs].sort((a, b) => 
        new Date(b.clockInTime) - new Date(a.clockInTime)
      );

      sortedLogs.forEach(log => {
        const employee = state.employees?.find(e => e.id === log.employeeId);
        const clockIn = new Date(log.clockInTime).toLocaleString('en-AU', { 
          timeZone: 'Australia/Perth',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        const clockOut = log.clockOutTime 
          ? new Date(log.clockOutTime).toLocaleString('en-AU', { 
              timeZone: 'Australia/Perth',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Still clocked in';
        
        console.log(`   ${employee?.name || 'Unknown'} (ID ${log.employeeId})`);
        console.log(`   Clock In:  ${clockIn}`);
        console.log(`   Clock Out: ${clockOut}`);
        console.log('');
      });

      // Save to file
      const filename = `recovery-data-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.json`;
      fs.writeFileSync(filename, JSON.stringify(state, null, 2));
      console.log(`\n💾 Full recovery data saved to: ${filename}`);
      console.log(`📋 Total time logs found: ${state.timeLogs.length}`);
      
      // Find the date range
      const dates = state.timeLogs.map(log => new Date(log.clockInTime));
      const earliest = new Date(Math.min(...dates));
      const latest = new Date(Math.max(...dates));
      console.log(`📅 Date range: ${earliest.toLocaleDateString('en-AU')} to ${latest.toLocaleDateString('en-AU')}`);
    } else {
      console.log('⚠️  No time logs found in recovery branch!');
    }
    
    } catch (err) {
      console.error('❌ Error querying Employee table:', err.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

extractRecoveryData();

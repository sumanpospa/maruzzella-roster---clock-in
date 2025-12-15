import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

const recoveryConnectionString =
  'postgresql://neondb_owner:npg_b3FTnjuqoxH1@ep-restless-bush-ad0fzat2-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function extractState() {
  const pool = new Pool({
    connectionString: recoveryConnectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔍 Extracting state from recovery branch...\n');

    // Get the state from PIN field
    const result = await pool.query('SELECT pin FROM "Employee" WHERE id = 999999');

    if (result.rows.length === 0 || !result.rows[0].pin) {
      console.log('❌ No state data found!');
      return;
    }

    const state = JSON.parse(result.rows[0].pin);

    console.log('📊 Recovery branch data:');
    console.log(`   - Employees: ${state.employees?.length || 0}`);
    console.log(
      `   - Current Week Shifts: ${
        state.rosters?.currentWeek ? Object.values(state.rosters.currentWeek).flat().length : 0
      }`,
    );
    console.log(
      `   - Next Week Shifts: ${
        state.rosters?.nextWeek ? Object.values(state.rosters.nextWeek).flat().length : 0
      }`,
    );
    console.log(`   - Time Logs: ${state.timeLogs?.length || 0}\n`);

    if (state.timeLogs && state.timeLogs.length > 0) {
      console.log('⏰ Time Logs found:\n');

      // Sort by clock in time
      const sortedLogs = [...state.timeLogs].sort(
        (a, b) => new Date(b.clockInTime) - new Date(a.clockInTime),
      );

      // Show summary
      sortedLogs.slice(0, 10).forEach((log) => {
        const employee = state.employees?.find((e) => e.id === log.employeeId);
        const clockIn = new Date(log.clockInTime).toLocaleString('en-AU', {
          timeZone: 'Australia/Perth',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
        const clockOut = log.clockOutTime
          ? new Date(log.clockOutTime).toLocaleString('en-AU', {
              timeZone: 'Australia/Perth',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Still clocked in';

        console.log(`   ${employee?.name || 'Unknown'} (ID ${log.employeeId})`);
        console.log(`   Clock In:  ${clockIn}`);
        console.log(`   Clock Out: ${clockOut}`);
        console.log('');
      });

      // Save full state to file
      const filename = `recovery-full-state-${
        new Date().toISOString().replace(/:/g, '-').split('.')[0]
      }.json`;
      fs.writeFileSync(filename, JSON.stringify(state, null, 2));
      console.log(`💾 Full recovery state saved to: ${filename}`);
      console.log(`📋 Total time logs found: ${state.timeLogs.length}`);

      // Find the date range
      const dates = state.timeLogs.map((log) => new Date(log.clockInTime));
      const earliest = new Date(Math.min(...dates));
      const latest = new Date(Math.max(...dates));
      console.log(
        `📅 Date range: ${earliest.toLocaleDateString('en-AU')} to ${latest.toLocaleDateString(
          'en-AU',
        )}\n`,
      );

      // Count logs per day
      const logsByDate = {};
      state.timeLogs.forEach((log) => {
        const date = new Date(log.clockInTime).toLocaleDateString('en-AU', {
          timeZone: 'Australia/Perth',
        });
        logsByDate[date] = (logsByDate[date] || 0) + 1;
      });

      console.log('📊 Time logs per day:');
      Object.keys(logsByDate)
        .sort()
        .forEach((date) => {
          console.log(`   ${date}: ${logsByDate[date]} logs`);
        });
    } else {
      console.log('⚠️  No time logs found!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

extractState();

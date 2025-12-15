import fs from 'fs';

const BACKEND_URL = 'https://maruzzella-roster-clock-in.onrender.com';

async function restoreRecoveryData() {
  try {
    console.log('📂 Reading recovery data...\n');

    // Read the recovery file
    const files = fs.readdirSync('.').filter((f) => f.startsWith('recovery-full-state-'));
    if (files.length === 0) {
      console.log('❌ No recovery file found!');
      return;
    }

    const recoveryFile = files.sort().pop(); // Get most recent
    console.log(`📄 Using: ${recoveryFile}\n`);

    const recoveryState = JSON.parse(fs.readFileSync(recoveryFile, 'utf8'));

    console.log('📊 Recovery data contains:');
    console.log(`   - Employees: ${recoveryState.employees.length}`);
    console.log(`   - Time Logs: ${recoveryState.timeLogs.length}`);
    console.log(
      `   - Current Week Shifts: ${Object.values(recoveryState.rosters.currentWeek).flat().length}`,
    );
    console.log(
      `   - Next Week Shifts: ${Object.values(recoveryState.rosters.nextWeek).flat().length}\n`,
    );

    console.log('🔄 Fetching current production state...\n');

    // Get current state
    const response = await fetch(`${BACKEND_URL}/api/state`);
    const currentState = await response.json();

    console.log('📊 Current production data:');
    console.log(`   - Employees: ${currentState.employees.length}`);
    console.log(`   - Time Logs: ${currentState.timeLogs.length}`);
    const currentWeekCount = currentState.rosters?.thisWeek
      ? Object.values(currentState.rosters.thisWeek).flat().length
      : 0;
    const nextWeekCount = currentState.rosters?.nextWeek
      ? Object.values(currentState.rosters.nextWeek).flat().length
      : 0;
    console.log(`   - Current Week Shifts: ${currentWeekCount}`);
    console.log(`   - Next Week Shifts: ${nextWeekCount}\n`);

    // Merge time logs - keep all unique logs
    const mergedTimeLogsMap = new Map();

    // Add current time logs
    currentState.timeLogs.forEach((log) => {
      mergedTimeLogsMap.set(log.id, log);
    });

    // Add recovery time logs (will overwrite if same ID)
    recoveryState.timeLogs.forEach((log) => {
      mergedTimeLogsMap.set(log.id, log);
    });

    const mergedTimeLogs = Array.from(mergedTimeLogsMap.values()).sort((a, b) => a.id - b.id);

    console.log('🔀 Merging data:');
    console.log(`   - Current time logs: ${currentState.timeLogs.length}`);
    console.log(`   - Recovery time logs: ${recoveryState.timeLogs.length}`);
    console.log(`   - Merged unique time logs: ${mergedTimeLogs.length}\n`);

    // Create merged state using current structure with recovered time logs
    const mergedState = {
      employees: currentState.employees, // Keep current employees (23)
      rosters: currentState.rosters || recoveryState.rosters, // Use current or fallback to recovery
      timeLogs: mergedTimeLogs, // Use merged time logs
    };

    // Show what will be restored
    console.log('✅ Final merged state:');
    console.log(`   - Employees: ${mergedState.employees.length}`);
    console.log(`   - Time Logs: ${mergedState.timeLogs.length}`);
    const finalCurrentWeekCount = mergedState.rosters?.thisWeek
      ? Object.values(mergedState.rosters.thisWeek).flat().length
      : 0;
    const finalNextWeekCount = mergedState.rosters?.nextWeek
      ? Object.values(mergedState.rosters.nextWeek).flat().length
      : 0;
    console.log(`   - Current Week Shifts: ${finalCurrentWeekCount}`);
    console.log(`   - Next Week Shifts: ${finalNextWeekCount}\n`);

    // Count logs per day in final merge
    const logsByDate = {};
    mergedState.timeLogs.forEach((log) => {
      const date = new Date(log.clockInTime).toLocaleDateString('en-AU', {
        timeZone: 'Australia/Perth',
      });
      logsByDate[date] = (logsByDate[date] || 0) + 1;
    });

    console.log('📊 Time logs per day in merged data:');
    Object.keys(logsByDate)
      .sort()
      .forEach((date) => {
        console.log(`   ${date}: ${logsByDate[date]} logs`);
      });

    console.log('\n⚠️  This will OVERWRITE the production database!');
    console.log('⏳ Press Ctrl+C within 5 seconds to cancel...\n');

    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log('📤 Pushing merged state to production...\n');

    const saveResponse = await fetch(`${BACKEND_URL}/api/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mergedState),
    });

    if (!saveResponse.ok) {
      throw new Error(`Failed to save: ${saveResponse.statusText}`);
    }

    console.log('✅ Recovery completed successfully!');
    console.log('💡 Refresh your browser to see the recovered data.\n');

    // Create backup of merged state
    const backupFilename = `./backups/backup-post-recovery-${
      new Date().toISOString().replace(/:/g, '-').split('.')[0]
    }.json`;
    fs.writeFileSync(backupFilename, JSON.stringify(mergedState, null, 2));
    console.log(`💾 Backup created: ${backupFilename}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

restoreRecoveryData();

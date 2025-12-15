import fs from 'fs';

const BACKEND_URL = 'https://maruzzella-roster-clock-in.onrender.com';

async function restoreRosters() {
  try {
    console.log('📂 Reading recovery data...\n');

    const recoveryFile = 'recovery-full-state-2025-12-02T05-35-02.json';
    const recoveryState = JSON.parse(fs.readFileSync(recoveryFile, 'utf8'));

    console.log('📊 Recovery rosters:');
    const recoveryCurrentWeek = Object.values(recoveryState.rosters.currentWeek).flat();
    const recoveryNextWeek = Object.values(recoveryState.rosters.nextWeek).flat();
    console.log(`   - Current Week: ${recoveryCurrentWeek.length} shifts`);
    console.log(`   - Next Week: ${recoveryNextWeek.length} shifts\n`);

    console.log('🔄 Fetching current production state...\n');

    const response = await fetch(`${BACKEND_URL}/api/state`);
    const currentState = await response.json();

    console.log('📊 Current production rosters:');
    const currentWeekCount = currentState.rosters?.thisWeek
      ? Object.values(currentState.rosters.thisWeek).flat().length
      : 0;
    const nextWeekCount = currentState.rosters?.nextWeek
      ? Object.values(currentState.rosters.nextWeek).flat().length
      : 0;
    console.log(`   - Current Week: ${currentWeekCount} shifts`);
    console.log(`   - Next Week: ${nextWeekCount} shifts\n`);

    // Merge rosters - use recovery's currentWeek, keep production's nextWeek if it exists
    const mergedRosters = {
      thisWeek: recoveryState.rosters.currentWeek, // Restore from recovery
      nextWeek: currentState.rosters?.nextWeek || recoveryState.rosters.nextWeek, // Keep current or use recovery
    };

    const mergedState = {
      employees: currentState.employees,
      rosters: mergedRosters,
      timeLogs: currentState.timeLogs, // Keep already recovered time logs
    };

    console.log('✅ Final merged state:');
    const finalCurrentWeek = Object.values(mergedState.rosters.thisWeek).flat();
    const finalNextWeek = Object.values(mergedState.rosters.nextWeek).flat();
    console.log(`   - Employees: ${mergedState.employees.length}`);
    console.log(`   - Current Week Shifts: ${finalCurrentWeek.length}`);
    console.log(`   - Next Week Shifts: ${finalNextWeek.length}`);
    console.log(`   - Time Logs: ${mergedState.timeLogs.length}\n`);

    // Show Current Week schedule
    console.log('📅 Current Week Schedule:');
    Object.keys(mergedState.rosters.thisWeek).forEach((day) => {
      const shifts = mergedState.rosters.thisWeek[day];
      console.log(`   ${day}: ${shifts.length} shifts`);
    });

    console.log('\n⚠️  This will restore Current Week rosters!');
    console.log('⏳ Press Ctrl+C within 5 seconds to cancel...\n');

    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log('📤 Pushing to production...\n');

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

    console.log('✅ Rosters restored successfully!');
    console.log('💡 Refresh your browser to see the restored rosters.\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

restoreRosters();

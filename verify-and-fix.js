import fetch from 'node-fetch';

const API_URL = 'https://maruzzella-roster-clock-in.onrender.com/api/state';

// Complete data with all employees and roster
const COMPLETE_DATA = {
  employees: [
    { id: 1, name: 'Huda', role: 'Manager', pin: '1111', department: 'Kitchen' },
    { id: 2, name: 'Suman', role: 'Manager', pin: '2222', department: 'Kitchen' },
    { id: 3, name: 'Luca', role: 'Chef', pin: '3333', department: 'Kitchen' },
    { id: 4, name: 'Dennis', role: 'Chef', pin: '4444', department: 'Kitchen' },
    { id: 5, name: 'Enrico', role: 'Chef', pin: '5555', department: 'Kitchen' },
    { id: 6, name: 'Sundesh', role: 'Chef', pin: '6666', department: 'Kitchen' },
    { id: 7, name: 'Siyam', role: 'Chef', pin: '7777', department: 'Kitchen' },
    { id: 8, name: 'Taki', role: 'Chef', pin: '8888', department: 'Kitchen' },
    { id: 9, name: 'Tanbir', role: 'Chef', pin: '9999', department: 'Kitchen' },
    { id: 10, name: 'Progganur', role: 'Chef', pin: '1010', department: 'Kitchen' },
    { id: 11, name: 'Fareeq', role: 'Chef', pin: '1112', department: 'Kitchen' },
    { id: 12, name: 'Manager FOH', role: 'Manager', pin: '1212', department: 'FOH' },
    { id: 13, name: 'Manager STW', role: 'Manager', pin: '1313', department: 'Stewarding' },
    { id: 14, name: 'mushfiq', role: 'Staff', pin: '1414', department: 'Stewarding' },
    { id: 15, name: 'mani', role: 'Staff', pin: '1515', department: 'Stewarding' },
    { id: 16, name: 'Ishraq', role: 'Staff', pin: '1616', department: 'Stewarding' },
    { id: 17, name: 'Ashfaq', role: 'Staff', pin: '1717', department: 'Stewarding' },
  ],
  rosters: {
    currentWeek: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    },
    nextWeek: {
      Monday: [
        { employeeId: 1, startTime: '17:00', endTime: '22:00', role: 'Manager' },
        { employeeId: 2, startTime: '10:00', endTime: '14:00', role: 'Manager' },
        { employeeId: 4, startTime: '16:00', endTime: '21:30', role: 'Chef' },
        { employeeId: 5, startTime: '16:00', endTime: '21:00', role: 'Chef' },
        { employeeId: 7, startTime: '17:00', endTime: '22:00', role: 'Chef' },
        { employeeId: 8, startTime: '16:00', endTime: '22:00', role: 'Chef' },
      ],
      Tuesday: [
        { employeeId: 1, startTime: '17:00', endTime: '22:00', role: 'Manager' },
        { employeeId: 2, startTime: '16:30', endTime: '22:00', role: 'Manager' },
        { employeeId: 3, startTime: '15:00', endTime: '21:00', role: 'Chef' },
        { employeeId: 4, startTime: '15:00', endTime: '21:30', role: 'Chef' },
        { employeeId: 5, startTime: '16:00', endTime: '21:00', role: 'Chef' },
        { employeeId: 7, startTime: '17:00', endTime: '22:00', role: 'Chef' },
        { employeeId: 8, startTime: '16:00', endTime: '22:00', role: 'Chef' },
        { employeeId: 9, startTime: '16:00', endTime: '22:00', role: 'Chef' },
      ],
      Wednesday: [
        { employeeId: 1, startTime: '17:00', endTime: '22:00', role: 'Manager' },
        { employeeId: 2, startTime: '10:00', endTime: '14:00', role: 'Manager' },
        { employeeId: 3, startTime: '14:00', endTime: '21:00', role: 'Chef' },
        { employeeId: 5, startTime: '16:00', endTime: '21:00', role: 'Chef' },
        { employeeId: 6, startTime: '17:00', endTime: '21:30', role: 'Chef' },
        { employeeId: 7, startTime: '17:00', endTime: '22:00', role: 'Chef' },
        { employeeId: 8, startTime: '16:00', endTime: '22:00', role: 'Chef' },
        { employeeId: 10, startTime: '17:00', endTime: '21:30', role: 'Chef' },
      ],
      Thursday: [
        { employeeId: 2, startTime: '16:30', endTime: '22:00', role: 'Manager' },
        { employeeId: 3, startTime: '14:00', endTime: '21:00', role: 'Chef' },
        { employeeId: 5, startTime: '10:00', endTime: '21:00', role: 'Chef' },
        { employeeId: 6, startTime: '17:00', endTime: '21:30', role: 'Chef' },
        { employeeId: 8, startTime: '16:00', endTime: '22:00', role: 'Chef' },
        { employeeId: 9, startTime: '16:00', endTime: '22:00', role: 'Chef' },
        { employeeId: 10, startTime: '17:00', endTime: '21:30', role: 'Chef' },
      ],
      Friday: [
        { employeeId: 1, startTime: '17:00', endTime: '22:00', role: 'Manager' },
        { employeeId: 2, startTime: '10:00', endTime: '14:00', role: 'Manager' },
        { employeeId: 3, startTime: '14:00', endTime: '21:00', role: 'Chef' },
        { employeeId: 4, startTime: '10:00', endTime: '21:30', role: 'Chef' },
        { employeeId: 5, startTime: '10:00', endTime: '14:00', role: 'Chef' },
      ],
      Saturday: [
        { employeeId: 2, startTime: '16:30', endTime: '22:00', role: 'Manager' },
        { employeeId: 3, startTime: '10:00', endTime: '21:00', role: 'Chef' },
        { employeeId: 4, startTime: '15:00', endTime: '21:30', role: 'Chef' },
        { employeeId: 7, startTime: '17:00', endTime: '22:00', role: 'Chef' },
        { employeeId: 9, startTime: '16:00', endTime: '22:00', role: 'Chef' },
      ],
      Sunday: [
        { employeeId: 4, startTime: '10:00', endTime: '21:30', role: 'Chef' },
        { employeeId: 6, startTime: '17:00', endTime: '21:30', role: 'Chef' },
        { employeeId: 8, startTime: '16:00', endTime: '22:00', role: 'Chef' },
        { employeeId: 10, startTime: '17:00', endTime: '21:30', role: 'Chef' },
      ],
    },
  },
  timeLogs: [],
};

async function main() {
  try {
    console.log('🔍 Checking current state...');
    const response = await fetch(API_URL);
    const currentState = await response.json();

    console.log('\n📊 Current State:');
    console.log(`  Employees: ${currentState.employees?.length || 0}`);
    console.log(
      `  Next Week Shifts: ${Object.values(currentState.rosters?.nextWeek || {}).flat().length}`,
    );

    const nextWeekShifts = Object.values(currentState.rosters?.nextWeek || {}).flat().length;

    if (nextWeekShifts === 43) {
      console.log('\n✅ Data looks good! All 43 shifts are present.');
      console.log('   The issue is likely browser cache.');
      console.log('\n💡 Solution: Press Ctrl+Shift+R in your browser to hard refresh.');
      return;
    }

    console.log('\n⚠️  Data is missing or incomplete. Restoring...');

    const saveResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(COMPLETE_DATA),
    });

    if (!saveResponse.ok) {
      throw new Error(`Failed to save: ${saveResponse.status}`);
    }

    console.log('\n✅ Database restored successfully!');
    console.log(`   Employees: ${COMPLETE_DATA.employees.length}`);
    console.log(`   Next Week Shifts: 43`);
    console.log('\n💡 Now press Ctrl+Shift+R in your browser to reload.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

main();

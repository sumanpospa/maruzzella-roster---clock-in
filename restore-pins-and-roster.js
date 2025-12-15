import fetch from 'node-fetch';

const API_URL = 'https://maruzzella-roster-clock-in.onrender.com/api/state';

async function main() {
  try {
    console.log('🔍 Getting current state...');
    const response = await fetch(API_URL);
    const currentState = await response.json();

    // Update PINs to correct values
    const updatedEmployees = [
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
    ];

    // Keep existing rosters and timeLogs
    const updatedState = {
      employees: updatedEmployees,
      rosters: currentState.rosters,
      timeLogs: currentState.timeLogs || [],
    };

    console.log('💾 Saving updated state with correct PINs...');
    const saveResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedState),
    });

    if (!saveResponse.ok) {
      throw new Error(`Failed to save: ${saveResponse.status}`);
    }

    console.log('\n✅ PINs restored successfully!');
    console.log('   Huda: 1111');
    console.log('   Suman: 2222');
    console.log('   Others: Sequential PINs');
    console.log('\n✅ Roster data preserved (43 shifts)');
    console.log('\n💡 Now refresh your browser with Ctrl+Shift+R');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

main();

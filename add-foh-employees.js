import fetch from 'node-fetch';

const API_URL = 'https://maruzzella-roster-clock-in.onrender.com/api/state';

async function main() {
  try {
    console.log('🔍 Getting current state...');
    const response = await fetch(API_URL);
    const currentState = await response.json();
    
    console.log(`Current employees: ${currentState.employees.length}`);
    
    // Add 6 new FOH employees (keeping existing Manager FOH as id 12)
    const newFOHEmployees = [
      { id: 18, name: 'Marco', role: 'Waiter', pin: '1818', department: 'FOH' },
      { id: 19, name: 'Sofia', role: 'Waiter', pin: '1919', department: 'FOH' },
      { id: 20, name: 'Giovanni', role: 'Bar Tender', pin: '2020', department: 'FOH' },
      { id: 21, name: 'Isabella', role: 'Food Runner', pin: '2121', department: 'FOH' },
      { id: 22, name: 'Alessandro', role: 'Waiter', pin: '2222', department: 'FOH' },
      { id: 23, name: 'Lucia', role: 'Waiter', pin: '2323', department: 'FOH' }
    ];
    
    // Combine existing employees with new FOH staff
    const updatedEmployees = [...currentState.employees, ...newFOHEmployees];
    
    const updatedState = {
      employees: updatedEmployees,
      rosters: currentState.rosters,
      timeLogs: currentState.timeLogs || []
    };
    
    console.log('\n💾 Adding 6 FOH employees...');
    const saveResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedState)
    });
    
    if (!saveResponse.ok) {
      throw new Error(`Failed to save: ${saveResponse.status}`);
    }
    
    console.log('\n✅ FOH employees added successfully!');
    console.log('\nNew FOH Staff:');
    newFOHEmployees.forEach(emp => {
      console.log(`  ${emp.name} (${emp.role}) - PIN: ${emp.pin}`);
    });
    console.log(`\n📊 Total employees now: ${updatedEmployees.length}`);
    console.log('   Kitchen: 11, FOH: 7, Stewarding: 5');
    console.log('\n💡 Refresh your browser to see the new employees!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

main();

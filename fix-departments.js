// Run this in browser console (F12) to redistribute employees across departments
// This script will take your 28 employees and distribute them properly

// Paste this entire script into the browser console and press Enter

(() => {
  console.log('🔧 Starting department redistribution...');
  
  // Get current employees from your app state
  // You'll need to manually set this based on what you see
  // Or we can reset to a clean state
  
  const cleanEmployees = [
    // Kitchen Team (11 employees)
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

    // FOH Team (7 employees)
    { id: 12, name: 'Manager FOH', role: 'Manager', pin: '1212', department: 'FOH' },
    { id: 13, name: 'Marco', role: 'Waiter', pin: '1818', department: 'FOH' },
    { id: 14, name: 'Sofia', role: 'Waiter', pin: '1919', department: 'FOH' },
    { id: 15, name: 'Giovanni', role: 'Waiter', pin: '2020', department: 'FOH' },
    { id: 16, name: 'Isabella', role: 'Waiter', pin: '2121', department: 'FOH' },
    { id: 17, name: 'Alessandro', role: 'Waiter', pin: '2323', department: 'FOH' },
    { id: 18, name: 'Lucia', role: 'Waiter', pin: '2424', department: 'FOH' },

    // Stewarding Team (5 employees)
    { id: 19, name: 'Manager STW', role: 'Manager', pin: '1313', department: 'Stewarding' },
    { id: 20, name: 'mushfiq', role: 'Staff', pin: '1414', department: 'Stewarding' },
    { id: 21, name: 'mani', role: 'Staff', pin: '1515', department: 'Stewarding' },
    { id: 22, name: 'Ishraq', role: 'Staff', pin: '1616', department: 'Stewarding' },
    { id: 23, name: 'Ashfaq', role: 'Staff', pin: '1717', department: 'Stewarding' },
  ];

  console.log(`📊 Setting ${cleanEmployees.length} employees with proper departments`);
  console.log('- Kitchen: 11 employees');
  console.log('- FOH: 7 employees');
  console.log('- Stewarding: 5 employees');
  
  // Save to localStorage if your app uses it
  try {
    localStorage.setItem('employees', JSON.stringify(cleanEmployees));
    console.log('✅ Saved to localStorage');
  } catch (e) {
    console.log('ℹ️ localStorage not used or failed');
  }
  
  console.log('');
  console.log('🔄 Now reload the page:');
  console.log('   location.reload()');
  console.log('');
  console.log('Or manually update your app state by finding the React component');
})();

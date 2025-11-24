// Script to update database with all employees from all departments

const API_URL = 'https://maruzzella-roster-clock-in.onrender.com/api/state';

const allEmployees = [
  // Kitchen Team (10 employees)
  { id: 1, name: 'Huda', role: 'Manager', pin: '1234', department: 'Kitchen' },
  { id: 2, name: 'Suman', role: 'Manager', pin: '1234', department: 'Kitchen' },
  { id: 3, name: 'Luca', role: 'Chef', pin: '1234', department: 'Kitchen' },
  { id: 4, name: 'Dennis', role: 'Chef', pin: '1234', department: 'Kitchen' },
  { id: 5, name: 'Enrico', role: 'Chef', pin: '1234', department: 'Kitchen' },
  { id: 6, name: 'Sundesh', role: 'Chef', pin: '1234', department: 'Kitchen' },
  { id: 7, name: 'Siyam', role: 'Chef', pin: '1234', department: 'Kitchen' },
  { id: 8, name: 'Taki', role: 'Chef', pin: '1234', department: 'Kitchen' },
  { id: 9, name: 'Tanbir', role: 'Chef', pin: '1234', department: 'Kitchen' },
  { id: 10, name: 'Progganur', role: 'Chef', pin: '1234', department: 'Kitchen' },
  
  // FOH Team (6 employees)
  { id: 11, name: 'Manager FOH', role: 'Manager', pin: '1234', department: 'FOH' },
  { id: 12, name: 'Marco', role: 'Waiter', pin: '1234', department: 'FOH' },
  { id: 13, name: 'Sofia', role: 'Waiter', pin: '1234', department: 'FOH' },
  { id: 14, name: 'Giovanni', role: 'Bar Tender', pin: '1234', department: 'FOH' },
  { id: 15, name: 'Isabella', role: 'Food Runner', pin: '1234', department: 'FOH' },
  { id: 16, name: 'Alessandro', role: 'Supervisor', pin: '1234', department: 'FOH' },
  
  // Stewarding Team (6 employees)
  { id: 17, name: 'Manager STW', role: 'Manager', pin: '1234', department: 'Stewarding' },
  { id: 18, name: 'Ahmed', role: 'Dishwasher', pin: '1234', department: 'Stewarding' },
  { id: 19, name: 'Raj', role: 'Dishwasher', pin: '1234', department: 'Stewarding' },
  { id: 20, name: 'Carlos', role: 'Cleaner', pin: '1234', department: 'Stewarding' },
  { id: 21, name: 'Miguel', role: 'Cleaner', pin: '1234', department: 'Stewarding' },
  { id: 22, name: 'Kumar', role: 'Dishwasher', pin: '1234', department: 'Stewarding' },
];

const emptyRosters = {
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
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  }
};

async function updateDatabase() {
  try {
    console.log('Updating database with all employees...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employees: allEmployees,
        rosters: emptyRosters,
        timeLogs: []
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Database updated successfully!');
    console.log(`📊 Total employees: ${result.employees.length}`);
    console.log(`   - Kitchen: ${result.employees.filter(e => e.department === 'Kitchen').length}`);
    console.log(`   - FOH: ${result.employees.filter(e => e.department === 'FOH').length}`);
    console.log(`   - Stewarding: ${result.employees.filter(e => e.department === 'Stewarding').length}`);
  } catch (error) {
    console.error('❌ Error updating database:', error);
  }
}

updateDatabase();

// Restore complete database with roster data

const API_URL = 'https://maruzzella-roster-clock-in.onrender.com/api/state';

const allEmployees = [
  // Kitchen Team (11 employees)
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
  { id: 11, name: 'Fareeq', role: 'Chef', pin: '1234', department: 'Kitchen' },

  // FOH Team
  { id: 12, name: 'Manager FOH', role: 'Manager', pin: '1234', department: 'FOH' },

  // Stewarding Team
  { id: 13, name: 'Manager STW', role: 'Manager', pin: '1234', department: 'Stewarding' },
  { id: 14, name: 'mushfiq', role: 'Dishwasher', pin: '1234', department: 'Stewarding' },
  { id: 15, name: 'mani', role: 'Dishwasher', pin: '1234', department: 'Stewarding' },
  { id: 16, name: 'Ishraq', role: 'Dishwasher', pin: '1234', department: 'Stewarding' },
  { id: 17, name: 'Ashfaq', role: 'Dishwasher', pin: '1234', department: 'Stewarding' },
];

// Roster data from your image - Next Week (Nov 24-30)
const nextWeekRoster = {
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
};

const rosters = {
  currentWeek: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  },
  nextWeek: nextWeekRoster,
};

async function restoreDatabase() {
  try {
    console.log('Restoring complete database with roster data...');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employees: allEmployees,
        rosters: rosters,
        timeLogs: [],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Database restored successfully!');
    console.log(`\n📊 Employees by Department:`);
    console.log(
      `   - Kitchen: ${
        result.employees.filter((e) => e.department === 'Kitchen').length
      } (includes Fareeq)`,
    );
    console.log(`   - FOH: ${result.employees.filter((e) => e.department === 'FOH').length}`);
    console.log(
      `   - Stewarding: ${result.employees.filter((e) => e.department === 'Stewarding').length}`,
    );
    console.log(`\n📅 Next Week Roster:`);
    Object.entries(result.rosters.nextWeek).forEach(([day, shifts]) => {
      console.log(`   - ${day}: ${shifts.length} shifts`);
    });
  } catch (error) {
    console.error('❌ Error restoring database:', error);
  }
}

restoreDatabase();

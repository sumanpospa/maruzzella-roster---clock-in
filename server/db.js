import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

// Helper to initialize database with default employees if empty
export async function initializeDatabase() {
  try {
    const employeeCount = await prisma.employee.count();
    
    if (employeeCount === 0) {
      console.log('[DB] Seeding default employees...');
      const defaultEmployees = [
        { name: 'Huda', role: 'Manager', pin: '1234' },
        { name: 'Suman', role: 'Manager', pin: '1234' },
        { name: 'Luca', role: 'Chef', pin: '1234' },
        { name: 'Dennis', role: 'Chef', pin: '1234' },
        { name: 'Enrico', role: 'Waiter', pin: '1234' },
        { name: 'Sundesh', role: 'Waiter', pin: '1234' },
        { name: 'Siyam', role: 'Waiter', pin: '1234' },
        { name: 'Taki', role: 'Waiter', pin: '1234' },
        { name: 'Tanbir', role: 'Host', pin: '1234' },
        { name: 'Progganur', role: 'Host', pin: '1234' },
      ];

      await prisma.employee.createMany({
        data: defaultEmployees,
      });
      
      console.log('[DB] ✅ Default employees seeded');
    } else {
      console.log(`[DB] Found ${employeeCount} employees in database`);
    }
  } catch (error) {
    console.error('[DB ERROR] Failed to initialize database:', error);
    throw error;
  }
}

// Convert database shifts to frontend format
export function convertShiftsToRoster(shifts) {
  const roster = {
    currentWeek: {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
      Friday: [], Saturday: [], Sunday: []
    },
    nextWeek: {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
      Friday: [], Saturday: [], Sunday: []
    }
  };

  shifts.forEach(shift => {
    const week = shift.week === 'currentWeek' ? roster.currentWeek : roster.nextWeek;
    if (week[shift.day]) {
      week[shift.day].push({
        employeeIds: shift.employees.map(e => e.id),
        startTime: shift.startTime,
        endTime: shift.endTime,
        notes: shift.notes,
      });
    }
  });

  return roster;
}

// Convert frontend roster format to database format
export async function saveRosterToDatabase(rosters) {
  try {
    // Delete all existing shifts
    await prisma.shift.deleteMany();

    const shiftsToCreate = [];

    for (const [weekKey, weekRoster] of Object.entries(rosters)) {
      for (const [day, dayShifts] of Object.entries(weekRoster)) {
        dayShifts.forEach(shift => {
          shiftsToCreate.push({
            week: weekKey,
            day: day,
            startTime: shift.startTime || null,
            endTime: shift.endTime || null,
            notes: shift.notes || null,
            employees: {
              connect: shift.employeeIds.map(id => ({ id }))
            }
          });
        });
      }
    }

    // Create all shifts
    for (const shiftData of shiftsToCreate) {
      await prisma.shift.create({
        data: shiftData
      });
    }

    console.log(`[DB] Saved ${shiftsToCreate.length} shifts`);
  } catch (error) {
    console.error('[DB ERROR] Failed to save roster:', error);
    throw error;
  }
}

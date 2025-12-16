// Bulk import shifts and time logs from JSON
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function importBulkData() {
  try {
    // Read data from JSON file
    const dataFile = process.argv[2] || './bulk-data.json';
    
    if (!fs.existsSync(dataFile)) {
      console.log('❌ Data file not found:', dataFile);
      console.log('\nCreate a file named "bulk-data.json" with this format:');
      console.log(JSON.stringify({
        shifts: [
          {
            day: "Monday",
            role: "Chef",
            startTime: "09:00",
            endTime: "17:00",
            employeeIds: [1, 2, 3]
          }
        ],
        timeLogs: [
          {
            employeeId: 1,
            date: "2025-12-15",
            clockIn: "09:00",
            clockOut: "17:00"
          }
        ]
      }, null, 2));
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    
    console.log('\n📊 Importing data...\n');
    
    // Import shifts
    if (data.shifts && data.shifts.length > 0) {
      for (const shift of data.shifts) {
        const created = await prisma.shift.create({
          data: {
            day: shift.day,
            role: shift.role,
            startTime: shift.startTime,
            endTime: shift.endTime,
            employees: {
              connect: shift.employeeIds.map(id => ({ id }))
            }
          }
        });
        console.log('✅ Created shift:', shift.day, shift.role, `(${shift.employeeIds.length} employees)`);
      }
    }
    
    // Import time logs
    if (data.timeLogs && data.timeLogs.length > 0) {
      for (const log of data.timeLogs) {
        const created = await prisma.timeLog.create({
          data: {
            employeeId: log.employeeId,
            date: new Date(log.date),
            clockIn: log.clockIn,
            clockOut: log.clockOut || null,
            notes: log.notes || null
          }
        });
        console.log('✅ Created time log for employee', log.employeeId, 'on', log.date);
      }
    }
    
    console.log('\n🎉 Import completed successfully!\n');
    
    // Show summary
    const totalShifts = await prisma.shift.count();
    const totalLogs = await prisma.timeLog.count();
    console.log('Total shifts in database:', totalShifts);
    console.log('Total time logs in database:', totalLogs);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

importBulkData();

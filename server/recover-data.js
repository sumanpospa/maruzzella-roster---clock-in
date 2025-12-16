// Recovery tool - restore data from localStorage backup
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function recoverFromBackup() {
  try {
    console.log('\n🔧 DATA RECOVERY TOOL\n');
    console.log('This tool will help you recover data from your browser backup.');
    console.log('\nSTEPS:');
    console.log('1. Open your browser where you entered the data');
    console.log('2. Press F12 to open DevTools');
    console.log('3. Go to Console tab');
    console.log('4. Paste this command:\n');
    console.log('   const backup = localStorage.getItem("roster-backup"); console.log(backup || "No backup found"); copy(backup);\n');
    console.log('5. The backup data will be copied to your clipboard');
    console.log('6. Create a file called "recovery-data.json" and paste the content');
    console.log('7. Run this script again with: node recover-data.js recovery-data.json\n');

    const backupFile = process.argv[2];
    
    if (!backupFile) {
      console.log('❌ No backup file provided. Follow the steps above first.');
      process.exit(1);
    }

    if (!fs.existsSync(backupFile)) {
      console.log(`❌ File not found: ${backupFile}`);
      process.exit(1);
    }

    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
    
    console.log('\n📊 Backup data found:');
    console.log('Timestamp:', backupData.timestamp);
    console.log('Employees:', backupData.employees?.length || 0);
    
    const currentWeekShifts = Object.values(backupData.rosters?.currentWeek || {}).flat().length;
    const nextWeekShifts = Object.values(backupData.rosters?.nextWeek || {}).flat().length;
    console.log('Current Week Shifts:', currentWeekShifts);
    console.log('Next Week Shifts:', nextWeekShifts);
    console.log('Time Logs:', backupData.timeLogs?.length || 0);
    
    if (currentWeekShifts === 0 && nextWeekShifts === 0 && (backupData.timeLogs?.length || 0) === 0) {
      console.log('\n⚠️  WARNING: This backup appears to be empty!');
      console.log('Are you sure you want to restore it? (y/n)');
      process.exit(1);
    }

    console.log('\n🔄 Restoring data to database...\n');

    // Import shifts from current week
    if (backupData.rosters?.currentWeek) {
      for (const [day, shifts] of Object.entries(backupData.rosters.currentWeek)) {
        for (const shift of (shifts as any[])) {
          try {
            await prisma.shift.create({
              data: {
                day: String(day),
                role: shift.role,
                startTime: shift.startTime,
                endTime: shift.endTime,
                employees: shift.employeeIds?.length > 0 ? {
                  connect: shift.employeeIds.map((id: number) => ({ id }))
                } : undefined
              }
            });
            console.log(`✅ Restored ${day} ${shift.role} shift`);
          } catch (err) {
            console.log(`⚠️  Skipped duplicate: ${day} ${shift.role}`);
          }
        }
      }
    }

    // Import time logs
    if (backupData.timeLogs && Array.isArray(backupData.timeLogs)) {
      for (const log of backupData.timeLogs) {
        try {
          await prisma.timeLog.create({
            data: {
              employeeId: log.employeeId,
              date: new Date(log.clockInTime || log.date),
              clockIn: log.clockIn || new Date(log.clockInTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
              clockOut: log.clockOut || (log.clockOutTime ? new Date(log.clockOutTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : null),
              notes: log.notes || null
            }
          });
          console.log(`✅ Restored time log for employee ${log.employeeId}`);
        } catch (err) {
          console.log(`⚠️  Skipped time log for employee ${log.employeeId}`);
        }
      }
    }

    console.log('\n🎉 RECOVERY COMPLETED!\n');
    
    const totalShifts = await prisma.shift.count();
    const totalLogs = await prisma.timeLog.count();
    console.log('Total shifts in database:', totalShifts);
    console.log('Total time logs in database:', totalLogs);
    console.log('\n✅ Your data has been restored!\n');

  } catch (error) {
    console.error('\n❌ Recovery failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recoverFromBackup();

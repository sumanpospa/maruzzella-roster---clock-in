import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const API_URL = 'https://maruzzella-roster-clock-in.onrender.com/api/state';
const BACKUP_DIR = './backups';

async function createBackup() {
  try {
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    console.log('📥 Downloading current state from database...');
    const response = await fetch(API_URL);
    const data = await response.json();

    // Create timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    // Save backup
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    // Calculate stats
    const employees = data.employees?.length || 0;
    const nextWeekShifts = Object.values(data.rosters?.nextWeek || {}).flat().length;
    const currentWeekShifts = Object.values(data.rosters?.currentWeek || {}).flat().length;
    const timeLogs = data.timeLogs?.length || 0;

    console.log('\n✅ Backup created successfully!');
    console.log(`📁 File: ${filename}`);
    console.log(`📊 Data backed up:`);
    console.log(`   - Employees: ${employees}`);
    console.log(`   - Current Week Shifts: ${currentWeekShifts}`);
    console.log(`   - Next Week Shifts: ${nextWeekShifts}`);
    console.log(`   - Time Logs: ${timeLogs}`);
    console.log(`\n💾 Backup saved to: ${filepath}`);

    // Keep only last 30 backups
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('backup_'))
      .sort()
      .reverse();

    if (files.length > 30) {
      console.log('\n🧹 Cleaning old backups...');
      files.slice(30).forEach((oldFile) => {
        fs.unlinkSync(path.join(BACKUP_DIR, oldFile));
        console.log(`   Deleted: ${oldFile}`);
      });
    }

    return filepath;
  } catch (error) {
    console.error('\n❌ Backup failed:', error.message);
    throw error;
  }
}

// Run backup
createBackup();

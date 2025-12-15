import fetch from 'node-fetch';
import fs from 'fs';

const API_URL = 'https://maruzzella-roster-clock-in.onrender.com/api/state';

async function restoreBackup(backupFile) {
  try {
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }

    console.log(`📂 Reading backup file: ${backupFile}`);
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));

    console.log('\n📊 Backup contains:');
    console.log(`   - Employees: ${backupData.employees?.length || 0}`);
    console.log(
      `   - Current Week Shifts: ${
        Object.values(backupData.rosters?.currentWeek || {}).flat().length
      }`,
    );
    console.log(
      `   - Next Week Shifts: ${Object.values(backupData.rosters?.nextWeek || {}).flat().length}`,
    );
    console.log(`   - Time Logs: ${backupData.timeLogs?.length || 0}`);

    console.log('\n⚠️  This will OVERWRITE the current database!');
    console.log('Press Ctrl+C within 5 seconds to cancel...\n');

    // 5 second delay to allow cancellation
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log('📤 Restoring backup to database...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backupData),
    });

    if (!response.ok) {
      throw new Error(`Failed to restore: ${response.status}`);
    }

    console.log('\n✅ Backup restored successfully!');
    console.log('💡 Refresh your browser to see the restored data.');
  } catch (error) {
    console.error('\n❌ Restore failed:', error.message);
    throw error;
  }
}

// Get backup file from command line argument
const backupFile = process.argv[2];

if (!backupFile) {
  console.error('❌ Usage: node restore-backup.js <backup-file-path>');
  console.error('Example: node restore-backup.js ./backups/backup_2025-11-24T10-30-00-000Z.json');
  process.exit(1);
}

restoreBackup(backupFile);

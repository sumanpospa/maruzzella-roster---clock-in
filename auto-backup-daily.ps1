# Automatic Daily Backup Script
# Run this script once per day (manually or via Task Scheduler)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "🕐 Starting daily backup at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan

# Run the backup
node backup-data.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Daily backup completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Backup failed!" -ForegroundColor Red
}

# Keep last 30 days of backups (cleanup happens in backup-data.js)

Write-Host ""
Write-Host "📊 Recent backups:" -ForegroundColor Yellow
Get-ChildItem .\backups\backup_*.json | Sort-Object LastWriteTime -Descending | Select-Object -First 5 | Format-Table Name, @{L='Size (KB)';E={[math]::Round($_.Length/1KB,2)}}, LastWriteTime

Write-Host "`n💡 Tip: Set up Windows Task Scheduler to run this script daily at 11:59 PM" -ForegroundColor Cyan

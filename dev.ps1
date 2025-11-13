# Quick start script for local development (Windows)
Write-Host "🚀 Starting Maruzzella Roster & Clock-In..." -ForegroundColor Green

# Start backend in background
Write-Host "📦 Starting backend on port 4000..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
  cd 'C:\Users\admin\Downloads\maruzzella-roster-&-clock-in\server'
  node index.js
}

# Give backend time to start
Start-Sleep -Seconds 2

# Start frontend
Write-Host "🎨 Starting frontend on port 3000..." -ForegroundColor Cyan
cd 'C:\Users\admin\Downloads\maruzzella-roster-&-clock-in'
node .\node_modules\vite\bin\vite.js --port 3000

# Cleanup on exit
Stop-Job -Job $backendJob

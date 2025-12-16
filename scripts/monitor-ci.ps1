# Monitor GitHub Actions for this repo and save logs for failed runs
# Usage: run this script in PowerShell. It will run indefinitely until stopped.

$repo = 'sumanpospa/maruzzella-roster---clock-in'
$seenFile = "$PSScriptRoot/.seen_runs"
$logDir = "$PSScriptRoot/ci-logs"
if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

# Load seen IDs
$seen = @()
if (Test-Path $seenFile) {
  $seen = Get-Content $seenFile | ForEach-Object { [int]$_ }
}

Write-Host "Starting CI monitor for $repo. Logs will be saved to $logDir"

while ($true) {
  try {
    $runsJson = gh run list --repo $repo --branch main --limit 10 --json databaseId,conclusion,status,headSha,createdAt 2>$null
    if (-not $runsJson) { Start-Sleep -Seconds 10; continue }
    $runs = $runsJson | ConvertFrom-Json

    foreach ($r in $runs) {
      $id = [int]$r.databaseId
      if ($seen -contains $id) { continue }
      # Mark as seen immediately
      $seen += $id
      Add-Content -Path $seenFile -Value $id

      if ($r.conclusion -eq 'failure') {
        $logPath = Join-Path $logDir "run-$id.log"
        Write-Host "Detected failed run $id - saving logs to $logPath"
        gh run view $id --repo $repo --log > $logPath 2>&1
      }
    }
  } catch {
    Write-Host "Monitor error: $_"
  }
  Start-Sleep -Seconds 20
}

# Monitor GitHub Actions (REST) and save logs for failed runs
# Requirements: set environment variable GITHUB_TOKEN with a token that has
# repo and workflow read permissions (or create a .env file in this folder
# with line: GITHUB_TOKEN=ghp_xxx).
#
# Usage (PowerShell):
#   $env:GITHUB_TOKEN = '...';
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\monitor-ci-rest.ps1

$repoFull = 'sumanpospa/maruzzella-roster---clock-in'
$apiBase = "https://api.github.com/repos/$repoFull/actions/runs?branch=main&per_page=10"
$seenFile = "$PSScriptRoot/.seen_runs_rest"
$logDir = "$PSScriptRoot/ci-logs-rest"
if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

function Get-TokenFromDotEnv($path) {
  if (!(Test-Path $path)) { return $null }
  $lines = Get-Content $path | Where-Object { $_ -and ($_ -match "=") }
  foreach ($line in $lines) {
    $parts = $line -split '='
    $k = $parts[0].Trim()
    $v = ($parts[1..($parts.Length - 1)] -join '=').Trim('"')
    if ($k -eq 'GITHUB_TOKEN') { return $v }
  }
  return $null
}

# load token from env or .env
$token = $env:GITHUB_TOKEN
if (-not $token) {
  $dot = Join-Path $PSScriptRoot '.env'
  $token = Get-TokenFromDotEnv $dot
}

if (-not $token) {
  Write-Host "ERROR: GITHUB_TOKEN not found in environment or .env. Please set it and re-run the script." -ForegroundColor Red
  exit 1
}

# Load seen ids
$seen = @{}
if (Test-Path $seenFile) {
  Get-Content $seenFile | ForEach-Object { $seen[[int]$_] = $true }
}

Write-Host "Starting REST CI monitor for $repoFull. Logs will be saved to $logDir"

while ($true) {
  try {
    $headers = @{
      Authorization = "Bearer $token"
      Accept = 'application/vnd.github+json'
      'User-Agent' = 'ci-monitor-rest-script'
    }

    $resp = Invoke-RestMethod -Uri $apiBase -Headers $headers -Method Get -ErrorAction Stop
    $runs = $resp.workflow_runs
    foreach ($r in $runs) {
      $id = [int]$r.id
      if ($seen.ContainsKey($id)) { continue }
      $seen[$id] = $true
      Add-Content -Path $seenFile -Value $id

      if ($r.conclusion -eq 'failure') {
        $runDir = Join-Path $logDir "run-$id"
        if (!(Test-Path $runDir)) { New-Item -ItemType Directory -Path $runDir | Out-Null }

        $metaPath = Join-Path $runDir "run-$id-meta.json"
        $r | ConvertTo-Json -Depth 5 | Out-File -FilePath $metaPath -Encoding utf8

        Write-Host "Detected failed run $id - downloading logs..."
        $logsUrl = "https://api.github.com/repos/$repoFull/actions/runs/$id/logs"
        $zipPath = Join-Path $runDir "run-$id-logs.zip"

        Invoke-WebRequest -Uri $logsUrl -Headers $headers -OutFile $zipPath -UseBasicParsing -ErrorAction Stop

        # Extract zip
        try {
          Expand-Archive -LiteralPath $zipPath -DestinationPath $runDir -Force
          Remove-Item $zipPath -Force
          Write-Host "Saved and extracted logs for run $id to $runDir"
        } catch {
          # Use explicit subexpression to safely interpolate the automatic variable
          Write-Host "Failed to extract logs for run $($id): $($_)" -ForegroundColor Yellow
          Write-Host "Zip saved at: $zipPath"
        }
      }
    }
  } catch {
    Write-Host "Monitor error: $_" -ForegroundColor Yellow
  }

  Start-Sleep -Seconds 20
}

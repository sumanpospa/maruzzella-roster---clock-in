<#
Deletes leftover/disabled Prisma native binaries on Windows environments.
Run from the repository root when you want to clean `.prisma` native files
that were temporarily renamed during local debugging.

Usage:
  powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-prisma-windows.ps1
#>

$paths = @(
  "server\node_modules\.prisma\client\query_engine-windows.dll.node.disabled",
  "server\node_modules\.prisma\client\query_engine-windows.dll.node"
)

foreach ($p in $paths) {
  $full = Join-Path -Path (Get-Location) -ChildPath $p
  if (Test-Path $full) {
    try {
      Remove-Item -LiteralPath $full -Force -ErrorAction Stop
      Write-Output "Removed: $p"
    } catch {
      Write-Warning "Failed to remove $p: $($_.Exception.Message)"
    }
  } else {
    Write-Output "Not found: $p"
  }
}

Write-Output "Cleanup complete."

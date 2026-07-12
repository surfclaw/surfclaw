# PowerShell Script to automatically sync agent brain state on a new machine.
# This script finds the latest active chat folder and copies the backup files into it.

$backupSource = Join-Path $PSScriptRoot "ai_docs\agent_brain"
$brainRoot = "C:\Users\$env:USERNAME\.gemini\antigravity\brain"

if (-not (Test-Path $backupSource)) {
    Write-Host "Error: Backup source directory not found at $backupSource" -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit
}

if (-not (Test-Path $brainRoot)) {
    Write-Host "Error: Antigravity brain root directory not found at $brainRoot" -ForegroundColor Red
    Write-Host "Please start a new chat in the editor first to initialize the system." -ForegroundColor Yellow
    Read-Host "Press Enter to exit..."
    exit
}

# Find the most recently modified folder under the brain root (the newly created chat room)
$latestFolder = Get-ChildItem -Path $brainRoot -Directory | 
                Sort-Object LastWriteTime -Descending | 
                Select-Object -First 1

if ($null -eq $latestFolder) {
    Write-Host "Error: No active chat folder found in $brainRoot" -ForegroundColor Red
    Write-Host "Please open a chat in the editor and send a message first." -ForegroundColor Yellow
    Read-Host "Press Enter to exit..."
    exit
}

Write-Host "Found active chat folder: $($latestFolder.FullName)" -ForegroundColor Green
Write-Host "Syncing brain files..." -ForegroundColor Cyan

# Copy backup files into the active chat folder
Copy-Item -Path "$backupSource\*" -Destination $latestFolder.FullName -Recurse -Force

Write-Host "Brain sync completed successfully! You can now resume your chat." -ForegroundColor Green
Read-Host "Press Enter to exit..."

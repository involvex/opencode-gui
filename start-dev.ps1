#Requires -Version 7
<#
# OpenCode VSCode Extension Development Startup Script
# Usage: .\start-dev.ps1
#

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting OpenCode VSCode Extension Development" -ForegroundColor Cyan
Write-Host ""

Write-Host "Building extension..." -ForegroundColor Yellow

# Run build using bun (as configured in package.json)
$buildResult = bun run build 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting watch mode..." -ForegroundColor Yellow
    Write-Host "Keep this terminal open while developing."
    Write-Host ""
    Write-Host "Now:" -ForegroundColor White
    Write-Host "1. Press F5 in VSCode/Cursor" -ForegroundColor White
    Write-Host "2. Or open Run & Debug panel and click the green play button" -ForegroundColor White
    Write-Host ""

    # Start watch mode in background and leave terminal open
    bun run watch
} else {
    Write-Host "❌ Build failed. Please fix errors and try again." -ForegroundColor Red
    Write-Host $buildResult
    exit 1
}
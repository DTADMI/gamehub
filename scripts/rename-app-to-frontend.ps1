# PowerShell script to rename apps/app to apps/frontend
# Run this from the repository root

Write-Host "GameHub: Renaming apps/app to apps/frontend" -ForegroundColor Green

# Check if apps/app exists
if (-Not (Test-Path "apps/app")) {
    Write-Host "Error: apps/app directory not found!" -ForegroundColor Red
    exit 1
}

# Check if apps/frontend already exists
if (Test-Path "apps/frontend") {
    Write-Host "Error: apps/frontend already exists!" -ForegroundColor Red
    exit 1
}

# Close any open handles (optional - user should do this manually)
Write-Host "Please ensure all editors and terminals are closed" -ForegroundColor Yellow
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Try Git rename first (preserves history)
Write-Host "Attempting git mv..." -ForegroundColor Cyan
git mv apps/app apps/frontend

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully renamed using git" -ForegroundColor Green
} else {
    Write-Host "Git rename failed, trying direct rename..." -ForegroundColor Yellow
    Rename-Item -Path "apps/app" -NewName "frontend"

    if ($?) {
        Write-Host "✓ Successfully renamed directory" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to rename directory" -ForegroundColor Red
        Write-Host "Please rename manually: ren apps\app frontend" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: pnpm install" -ForegroundColor White
Write-Host "2. Run: pnpm build" -ForegroundColor White
Write-Host "3. Verify: pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "Done! ✓" -ForegroundColor Green

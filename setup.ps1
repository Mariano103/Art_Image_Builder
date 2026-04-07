# Quick Setup Script
# Run this script to quickly set up your AI Image Editor

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Image Editor - Quick Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "  Node.js $nodeVersion detected" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "  Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if .env exists
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "  backend\.env file found" -ForegroundColor Green
} else {
    Write-Host "  Creating backend\.env file from template..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "  backend\.env file created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  IMPORTANT: Edit .env and add your API key!" -ForegroundColor Red
    Write-Host "  - For OpenAI: Get key from https://platform.openai.com" -ForegroundColor Yellow
    Write-Host "  - For Stability: Get key from https://platform.stability.ai" -ForegroundColor Yellow
    Write-Host ""
    
    # Prompt user to edit .env
    $response = Read-Host "Do you want to open backend\.env now to add your API key? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        notepad backend\.env
    }
}

# Install backend dependencies
Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray
Set-Location backend
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Dependencies installed successfully!" -ForegroundColor Green
    Set-Location ..
} else {
    Write-Host "  ERROR: Failed to install dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Final instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Ensure your API key is set in backend\.env file" -ForegroundColor White
Write-Host "  2. Run: npm start   (or: cd backend && npm start)" -ForegroundColor White
Write-Host "  3. Open: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "For development with auto-reload:" -ForegroundColor Cyan
Write-Host "  npm run dev   (or: cd backend && npm run dev)" -ForegroundColor White
Write-Host ""

$startNow = Read-Host "Do you want to start the server now? (y/n)"
if ($startNow -eq 'y' -or $startNow -eq 'Y') {
    Write-Host ""
    Write-Host "Starting server..." -ForegroundColor Green
    npm start
}

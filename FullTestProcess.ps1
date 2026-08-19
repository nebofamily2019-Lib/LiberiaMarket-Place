# LibMarket Automated Test Workflow (with error logging)
$logFile = "C:\Users\Maeyen\CommunityE-commerce-SPA-Liberia\test-errors.log"
if (Test-Path $logFile) { Remove-Item $logFile}

Write-Host "=== Starting LibMarket Automated Test Suite ===" -ForegroundColor Cyan

function Run-Step($message, $command) {
    Write-Host "`n$message" -ForegroundColor Yellow
    Invoke-Expression $command
    if ($LASTEXITCODE -ne 0) {
        $errorMsg = "`n[ERROR] Step failed: $message"
        Write-Host $errorMsg -ForegroundColor Red
        Add-Content -Path $logFile -Value $errorMsg
        Add-Content -Path $logFile -Value "Command: $command"
        Add-Content -Path $logFile -Value "Exit code: $LASTEXITCODE"
        exit $LASTEXITCODE
    }
}

Run-Step "[1/8] Installing backend dependencies..." 'cd "C:\Users\Maeyen\CommunityE-commerce-SPA-Liberia\backend"; npm install'
Run-Step "[2/8] Seeding backend categories..." 'node seedCategories.js'
Run-Step "[3/8] Running backend unit/integration tests..." 'npm test'
Run-Step "[4/8] Generating backend coverage report..." 'npm run test:coverage'
Run-Step "[5/8] Installing frontend dependencies..." 'cd "..\frontend"; npm install'
Run-Step "[6/8] Running frontend unit/integration tests..." 'npm run test:run'
Run-Step "[7/8] Generating frontend coverage report..." 'npm run test:coverage'
# Run-Step "[8/8] Running E2E tests with Playwright..." 'npx playwright test'

Write-Host "`n=== All automated tests completed successfully! ===" -ForegroundColor Green
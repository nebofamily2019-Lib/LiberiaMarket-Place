# LibMarket Interactive Testing Script
# This script provides an interactive menu for running various test suites

param(
    [string]$Mode = "interactive"
)

# Color definitions
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Show-Banner {
    Clear-Host
    Write-ColorOutput "================================================================" "Cyan"
    Write-ColorOutput "          LibMarket E-commerce Testing Suite                 " "Cyan"
    Write-ColorOutput "              Community Marketplace for Liberia               " "Cyan"
    Write-ColorOutput "================================================================" "Cyan"
    Write-Host ""
}

function Show-TestResults {
    param(
        [string]$TestName,
        [int]$ExitCode,
        [string]$Output
    )

    Write-Host ""
    Write-ColorOutput "================================================================" "Yellow"
    Write-ColorOutput "  Test Results: $TestName" "Yellow"
    Write-ColorOutput "================================================================" "Yellow"

    if ($ExitCode -eq 0) {
        Write-ColorOutput "[PASS] All tests PASSED!" "Green"
    } else {
        Write-ColorOutput "[FAIL] Some tests FAILED (Exit Code: $ExitCode)" "Red"
    }

    # Parse output for summary
    if ($Output -match "Tests:\s+(\d+)\s+passed") {
        Write-ColorOutput "  Passed: $($matches[1])" "Green"
    }
    if ($Output -match "(\d+)\s+failed") {
        Write-ColorOutput "  Failed: $($matches[1])" "Red"
    }
    if ($Output -match "Test Suites:\s+.*?(\d+)\s+passed") {
        Write-ColorOutput "  Test Suites Passed: $($matches[1])" "Cyan"
    }

    Write-ColorOutput "================================================================" "Yellow"
    Write-Host ""
}

function Run-BackendMVPTests {
    Write-ColorOutput "`n================================================================" "Cyan"
    Write-ColorOutput "  BACKEND MVP TESTS" "Cyan"
    Write-ColorOutput "================================================================" "Cyan"
    Write-ColorOutput "   Testing: Authentication and Product/Category Flow" "Gray"
    Write-ColorOutput "   Location: ./backend" "Gray"
    Write-Host ""

    Write-ColorOutput "[Step 1/3] Navigating to backend directory..." "DarkCyan"
    Push-Location backend
    Write-ColorOutput "[OK] Current directory: $(Get-Location)" "Green"
    Write-Host ""

    # Run Auth MVP Test
    Write-ColorOutput "[Step 2/3] Running Auth MVP Test..." "Yellow"
    Write-ColorOutput "   Test File: auth.mvp.test.js" "Gray"
    Write-ColorOutput "   Command: npm test -- auth.mvp.test.js" "Gray"
    Write-ColorOutput "   Please wait..." "DarkYellow"
    Write-Host ""

    $output = npm test -- auth.mvp.test.js 2>&1 | Out-String
    $authExitCode = $LASTEXITCODE

    Write-ColorOutput "[Test Output]" "DarkGray"
    Write-Output $output
    Show-TestResults "Auth MVP" $authExitCode $output

    # Run Category/Product MVP Test
    Write-ColorOutput "[Step 3/3] Running Category/Product MVP Test..." "Yellow"
    Write-ColorOutput "   Test File: category.product.mvp.test.js" "Gray"
    Write-ColorOutput "   Command: npm test -- category.product.mvp.test.js" "Gray"
    Write-ColorOutput "   Please wait..." "DarkYellow"
    Write-Host ""

    $output = npm test -- category.product.mvp.test.js 2>&1 | Out-String
    $catExitCode = $LASTEXITCODE

    Write-ColorOutput "[Test Output]" "DarkGray"
    Write-Output $output
    Show-TestResults "Category/Product MVP" $catExitCode $output

    Write-ColorOutput "Returning to original directory..." "DarkCyan"
    Pop-Location
    Write-ColorOutput "[OK] Returned to: $(Get-Location)" "Green"
    Write-Host ""

    Write-ColorOutput "================================================================" "Cyan"
    Write-ColorOutput "  BACKEND MVP SUMMARY" "Cyan"
    Write-ColorOutput "================================================================" "Cyan"
    if ($authExitCode -eq 0 -and $catExitCode -eq 0) {
        Write-ColorOutput "[PASS] All Backend MVP Tests PASSED!" "Green"
        Write-ColorOutput "   Auth Tests: PASSED" "Green"
        Write-ColorOutput "   Product/Category Tests: PASSED" "Green"
        return 0
    } else {
        Write-ColorOutput "[FAIL] Some Backend MVP Tests FAILED!" "Red"
        if ($authExitCode -ne 0) {
            Write-ColorOutput "   Auth Tests: FAILED (Exit Code: $authExitCode)" "Red"
        } else {
            Write-ColorOutput "   Auth Tests: PASSED" "Green"
        }
        if ($catExitCode -ne 0) {
            Write-ColorOutput "   Product/Category Tests: FAILED (Exit Code: $catExitCode)" "Red"
        } else {
            Write-ColorOutput "   Product/Category Tests: PASSED" "Green"
        }
        return 1
    }
}

function Run-FrontendMVPTests {
    Write-ColorOutput "`n================================================================" "Cyan"
    Write-ColorOutput "  FRONTEND MVP TESTS" "Cyan"
    Write-ColorOutput "================================================================" "Cyan"
    Write-ColorOutput "   Testing: Product and Category Services" "Gray"
    Write-ColorOutput "   Location: ./frontend" "Gray"
    Write-Host ""

    Write-ColorOutput "[Step 1/2] Navigating to frontend directory..." "DarkCyan"
    Push-Location frontend
    Write-ColorOutput "[OK] Current directory: $(Get-Location)" "Green"
    Write-Host ""

    Write-ColorOutput "[Step 2/2] Running Frontend MVP Test..." "Yellow"
    Write-ColorOutput "   Test File: productCategory.mvp.test.ts" "Gray"
    Write-ColorOutput "   Command: npm test -- productCategory.mvp.test.ts" "Gray"
    Write-ColorOutput "   Please wait..." "DarkYellow"
    Write-Host ""

    $output = npm test -- productCategory.mvp.test.ts 2>&1 | Out-String
    $exitCode = $LASTEXITCODE

    Write-ColorOutput "[Test Output]" "DarkGray"
    Write-Output $output
    Show-TestResults "Frontend MVP" $exitCode $output

    Write-ColorOutput "Returning to original directory..." "DarkCyan"
    Pop-Location
    Write-ColorOutput "[OK] Returned to: $(Get-Location)" "Green"
    Write-Host ""

    Write-ColorOutput "================================================================" "Cyan"
    Write-ColorOutput "  FRONTEND MVP SUMMARY" "Cyan"
    Write-ColorOutput "================================================================" "Cyan"
    if ($exitCode -eq 0) {
        Write-ColorOutput "[PASS] All Frontend MVP Tests PASSED!" "Green"
        return 0
    } else {
        Write-ColorOutput "[FAIL] Some Frontend MVP Tests FAILED!" "Red"
        Write-ColorOutput "   Exit Code: $exitCode" "Red"
        return 1
    }
}

function Run-AllBackendTests {
    Write-ColorOutput "`n================================================================" "Cyan"
    Write-ColorOutput "  ALL BACKEND TESTS" "Cyan"
    Write-ColorOutput "================================================================" "Cyan"
    Write-ColorOutput "   Running complete backend test suite" "Gray"
    Write-ColorOutput "   This may take a few minutes..." "Gray"
    Write-Host ""

    Write-ColorOutput "[Step 1/2] Navigating to backend directory..." "DarkCyan"
    Push-Location backend
    Write-ColorOutput "[OK] Current directory: $(Get-Location)" "Green"
    Write-Host ""

    Write-ColorOutput "[Step 2/2] Running all backend tests..." "Yellow"
    Write-ColorOutput "   Command: npm test" "Gray"
    Write-ColorOutput "   Please wait (this may take 1-2 minutes)..." "DarkYellow"
    Write-Host ""

    $output = npm test 2>&1 | Out-String
    $exitCode = $LASTEXITCODE

    Write-ColorOutput "[Test Output]" "DarkGray"
    Write-Output $output
    Show-TestResults "All Backend Tests" $exitCode $output

    Write-ColorOutput "Returning to original directory..." "DarkCyan"
    Pop-Location

    return $exitCode
}

function Run-AllFrontendTests {
    Write-ColorOutput "`n================================================================" "Cyan"
    Write-ColorOutput "  ALL FRONTEND TESTS" "Cyan"
    Write-ColorOutput "================================================================" "Cyan"
    Write-ColorOutput "   Running complete frontend test suite" "Gray"
    Write-ColorOutput "   This may take a few minutes..." "Gray"
    Write-Host ""

    Write-ColorOutput "[Step 1/2] Navigating to frontend directory..." "DarkCyan"
    Push-Location frontend
    Write-ColorOutput "[OK] Current directory: $(Get-Location)" "Green"
    Write-Host ""

    Write-ColorOutput "[Step 2/2] Running all frontend tests..." "Yellow"
    Write-ColorOutput "   Command: npm test" "Gray"
    Write-ColorOutput "   Please wait (this may take 1-2 minutes)..." "DarkYellow"
    Write-Host ""

    $output = npm test 2>&1 | Out-String
    $exitCode = $LASTEXITCODE

    Write-ColorOutput "[Test Output]" "DarkGray"
    Write-Output $output
    Show-TestResults "All Frontend Tests" $exitCode $output

    Write-ColorOutput "Returning to original directory..." "DarkCyan"
    Pop-Location

    return $exitCode
}

function Run-FrontendTestsWithUI {
    Write-ColorOutput "`n================================================================" "Cyan"
    Write-ColorOutput "  FRONTEND TESTS WITH UI" "Cyan"
    Write-ColorOutput "================================================================" "Cyan"
    Write-ColorOutput "   Opening interactive Vitest UI in browser" "Gray"
    Write-ColorOutput "   This will start a local server" "Gray"
    Write-Host ""

    Write-ColorOutput "[Step 1/2] Navigating to frontend directory..." "DarkCyan"
    Push-Location frontend
    Write-ColorOutput "[OK] Current directory: $(Get-Location)" "Green"
    Write-Host ""

    Write-ColorOutput "[Step 2/2] Starting Vitest UI server..." "Yellow"
    Write-ColorOutput "   Command: npm run test:ui" "Gray"
    Write-ColorOutput "   Server will start at http://localhost:51204" "Gray"
    Write-ColorOutput "   Browser will open automatically" "Gray"
    Write-Host ""
    Write-ColorOutput "[IMPORTANT] Press Ctrl+C to stop the server when done" "Yellow"
    Write-Host ""

    npm run test:ui

    Write-ColorOutput "`nServer stopped. Returning to original directory..." "DarkCyan"
    Pop-Location
}

function Run-BackendCoverage {
    Write-ColorOutput "`n================================================================" "Cyan"
    Write-ColorOutput "  BACKEND TEST COVERAGE" "Cyan"
    Write-ColorOutput "================================================================" "Cyan"
    Write-ColorOutput "   Generating code coverage report for backend" "Gray"
    Write-ColorOutput "   This will run all tests and measure coverage" "Gray"
    Write-Host ""

    Write-ColorOutput "[Step 1/3] Navigating to backend directory..." "DarkCyan"
    Push-Location backend
    Write-ColorOutput "[OK] Current directory: $(Get-Location)" "Green"
    Write-Host ""

    Write-ColorOutput "[Step 2/3] Running tests with coverage analysis..." "Yellow"
    Write-ColorOutput "   Command: npm run test:coverage" "Gray"
    Write-ColorOutput "   Please wait (this may take 1-2 minutes)..." "DarkYellow"
    Write-Host ""

    $output = npm run test:coverage 2>&1 | Out-String
    $exitCode = $LASTEXITCODE

    Write-ColorOutput "[Coverage Output]" "DarkGray"
    Write-Output $output

    Write-ColorOutput "`n[Step 3/3] Checking coverage report generation..." "Yellow"
    if ($exitCode -eq 0) {
        Write-ColorOutput "[SUCCESS] Coverage report generated!" "Green"
        Write-Host ""
        Write-ColorOutput "Report Details:" "Cyan"
        Write-ColorOutput "   HTML Report: backend/coverage/lcov-report/index.html" "White"
        Write-ColorOutput "   JSON Report: backend/coverage/coverage-final.json" "White"
        Write-ColorOutput "   Text Report: Displayed above" "White"
        Write-Host ""
        Write-ColorOutput "To view the HTML report, open:" "Yellow"
        Write-ColorOutput "   $(Get-Location)\coverage\lcov-report\index.html" "White"
    } else {
        Write-ColorOutput "[FAIL] Coverage report generation failed!" "Red"
        Write-ColorOutput "   Exit Code: $exitCode" "Red"
    }

    Write-ColorOutput "`nReturning to original directory..." "DarkCyan"
    Pop-Location

    return $exitCode
}

function Run-FrontendCoverage {
    Write-ColorOutput "`n================================================================" "Cyan"
    Write-ColorOutput "  FRONTEND TEST COVERAGE" "Cyan"
    Write-ColorOutput "================================================================" "Cyan"
    Write-ColorOutput "   Generating code coverage report for frontend" "Gray"
    Write-ColorOutput "   This will run all tests and measure coverage" "Gray"
    Write-Host ""

    Write-ColorOutput "[Step 1/3] Navigating to frontend directory..." "DarkCyan"
    Push-Location frontend
    Write-ColorOutput "[OK] Current directory: $(Get-Location)" "Green"
    Write-Host ""

    Write-ColorOutput "[Step 2/3] Running tests with coverage analysis..." "Yellow"
    Write-ColorOutput "   Command: npm run test:coverage" "Gray"
    Write-ColorOutput "   Please wait (this may take 1-2 minutes)..." "DarkYellow"
    Write-Host ""

    $output = npm run test:coverage 2>&1 | Out-String
    $exitCode = $LASTEXITCODE

    Write-ColorOutput "[Coverage Output]" "DarkGray"
    Write-Output $output

    Write-ColorOutput "`n[Step 3/3] Checking coverage report generation..." "Yellow"
    if ($exitCode -eq 0) {
        Write-ColorOutput "[SUCCESS] Coverage report generated!" "Green"
        Write-Host ""
        Write-ColorOutput "Report Details:" "Cyan"
        Write-ColorOutput "   HTML Report: frontend/coverage/index.html" "White"
        Write-ColorOutput "   JSON Report: frontend/coverage/coverage-final.json" "White"
        Write-ColorOutput "   Text Report: Displayed above" "White"
        Write-Host ""
        Write-ColorOutput "To view the HTML report, open:" "Yellow"
        Write-ColorOutput "   $(Get-Location)\coverage\index.html" "White"
    } else {
        Write-ColorOutput "[FAIL] Coverage report generation failed!" "Red"
        Write-ColorOutput "   Exit Code: $exitCode" "Red"
    }

    Write-ColorOutput "`nReturning to original directory..." "DarkCyan"
    Pop-Location

    return $exitCode
}

function Run-E2ETests {
    Write-ColorOutput "`n================================================================" "Magenta"
    Write-ColorOutput "  COMPLETE END-TO-END MVP TEST FLOW" "Magenta"
    Write-ColorOutput "================================================================" "Magenta"
    Write-ColorOutput "   This will run all MVP tests in sequence:" "Gray"
    Write-ColorOutput "   1. Backend Auth MVP Tests" "Gray"
    Write-ColorOutput "   2. Backend Product/Category MVP Tests" "Gray"
    Write-ColorOutput "   3. Frontend MVP Tests" "Gray"
    Write-Host ""
    Write-ColorOutput "Starting E2E test execution..." "DarkYellow"
    Write-Host ""

    Write-ColorOutput "================================================================" "Magenta"
    Write-ColorOutput "  PHASE 1 OF 2: Backend MVP Tests" "Magenta"
    Write-ColorOutput "================================================================" "Magenta"
    Write-ColorOutput "Testing backend authentication and product functionality..." "Gray"
    Write-Host ""

    $backendResult = Run-BackendMVPTests

    Write-Host ""
    Write-ColorOutput "================================================================" "Magenta"
    Write-ColorOutput "  PHASE 2 OF 2: Frontend MVP Tests" "Magenta"
    Write-ColorOutput "================================================================" "Magenta"
    Write-ColorOutput "Testing frontend category and product services..." "Gray"
    Write-Host ""

    $frontendResult = Run-FrontendMVPTests

    Write-Host ""
    Write-ColorOutput "================================================================" "Magenta"
    Write-ColorOutput "  FINAL E2E TEST RESULTS" "Magenta"
    Write-ColorOutput "================================================================" "Magenta"
    Write-Host ""

    if ($backendResult -eq 0 -and $frontendResult -eq 0) {
        Write-ColorOutput "*** ALL MVP TESTS PASSED! ***" "Green"
        Write-Host ""
        Write-ColorOutput "Summary:" "Cyan"
        Write-ColorOutput "   Backend MVP Tests: PASSED" "Green"
        Write-ColorOutput "   Frontend MVP Tests: PASSED" "Green"
        Write-Host ""
        Write-ColorOutput "Your application core functionality is working correctly!" "Green"
        Write-ColorOutput "The MVP is ready for deployment." "Green"
        return 0
    } else {
        Write-ColorOutput "WARNING: Some MVP tests failed!" "Yellow"
        Write-Host ""
        Write-ColorOutput "Summary:" "Cyan"
        if ($backendResult -eq 0) {
            Write-ColorOutput "   Backend MVP Tests: PASSED" "Green"
        } else {
            Write-ColorOutput "   Backend MVP Tests: FAILED" "Red"
        }
        if ($frontendResult -eq 0) {
            Write-ColorOutput "   Frontend MVP Tests: PASSED" "Green"
        } else {
            Write-ColorOutput "   Frontend MVP Tests: FAILED" "Red"
        }
        Write-Host ""
        Write-ColorOutput "Please review the test output above for details." "Yellow"
        return 1
    }
}

function Show-Menu {
    Write-ColorOutput "`n================================================================" "Cyan"
    Write-ColorOutput "                    Testing Options                           " "Cyan"
    Write-ColorOutput "================================================================" "Cyan"
    Write-Host ""
    Write-ColorOutput "  MVP Tests (Recommended):" "Yellow"
    Write-ColorOutput "    1. Run Backend MVP Tests (Auth + Products)" "White"
    Write-ColorOutput "    2. Run Frontend MVP Tests" "White"
    Write-ColorOutput "    3. Run Complete E2E MVP Tests (Backend + Frontend)" "White"
    Write-Host ""
    Write-ColorOutput "  Complete Test Suites:" "Yellow"
    Write-ColorOutput "    4. Run All Backend Tests" "White"
    Write-ColorOutput "    5. Run All Frontend Tests" "White"
    Write-ColorOutput "    6. Run Frontend Tests with Interactive UI" "White"
    Write-Host ""
    Write-ColorOutput "  Coverage Reports:" "Yellow"
    Write-ColorOutput "    7. Backend Test Coverage" "White"
    Write-ColorOutput "    8. Frontend Test Coverage" "White"
    Write-Host ""
    Write-ColorOutput "  9. Exit" "Red"
    Write-Host ""
}

function Main {
    # MVP Mode
    if ($Mode -eq "mvp") {
        Show-Banner
        Write-ColorOutput "[MODE] Running in MVP test mode" "DarkYellow"
        Write-ColorOutput "[INFO] This will execute complete E2E MVP tests" "Gray"
        Write-Host ""
        Run-E2ETests
        Write-Host ""
        Write-ColorOutput "[COMPLETE] MVP test execution finished" "DarkYellow"
        return
    }

    # Backend Mode
    if ($Mode -eq "backend") {
        Show-Banner
        Write-ColorOutput "[MODE] Running in Backend test mode" "DarkYellow"
        Write-ColorOutput "[INFO] This will execute backend MVP tests only" "Gray"
        Write-Host ""
        Run-BackendMVPTests
        Write-Host ""
        Write-ColorOutput "[COMPLETE] Backend test execution finished" "DarkYellow"
        return
    }

    # Frontend Mode
    if ($Mode -eq "frontend") {
        Show-Banner
        Write-ColorOutput "[MODE] Running in Frontend test mode" "DarkYellow"
        Write-ColorOutput "[INFO] This will execute frontend MVP tests only" "Gray"
        Write-Host ""
        Run-FrontendMVPTests
        Write-Host ""
        Write-ColorOutput "[COMPLETE] Frontend test execution finished" "DarkYellow"
        return
    }

    # Interactive mode
    Write-ColorOutput "[MODE] Running in Interactive mode" "DarkYellow"
    Write-ColorOutput "[INFO] Use the menu to select tests to run" "Gray"
    Write-Host ""

    while ($true) {
        Show-Banner
        Show-Menu

        Write-Host ""
        Write-ColorOutput "Waiting for user input..." "DarkGray"
        $choice = Read-Host "Select an option (1-9)"
        Write-ColorOutput "[SELECTED] Option $choice" "DarkYellow"

        switch ($choice) {
            "1" {
                Write-ColorOutput "[ACTION] Executing Backend MVP Tests..." "DarkCyan"
                Run-BackendMVPTests
                Pause
            }
            "2" {
                Write-ColorOutput "[ACTION] Executing Frontend MVP Tests..." "DarkCyan"
                Run-FrontendMVPTests
                Pause
            }
            "3" {
                Write-ColorOutput "[ACTION] Executing Complete E2E MVP Tests..." "DarkCyan"
                Run-E2ETests
                Pause
            }
            "4" {
                Write-ColorOutput "[ACTION] Executing All Backend Tests..." "DarkCyan"
                Run-AllBackendTests
                Pause
            }
            "5" {
                Write-ColorOutput "[ACTION] Executing All Frontend Tests..." "DarkCyan"
                Run-AllFrontendTests
                Pause
            }
            "6" {
                Write-ColorOutput "[ACTION] Launching Frontend Test UI..." "DarkCyan"
                Run-FrontendTestsWithUI
            }
            "7" {
                Write-ColorOutput "[ACTION] Generating Backend Coverage Report..." "DarkCyan"
                Run-BackendCoverage
                Pause
            }
            "8" {
                Write-ColorOutput "[ACTION] Generating Frontend Coverage Report..." "DarkCyan"
                Run-FrontendCoverage
                Pause
            }
            "9" {
                Write-ColorOutput "`n[EXIT] User requested exit" "DarkYellow"
                Write-ColorOutput "Exiting... Goodbye!" "Cyan"
                return
            }
            default {
                Write-ColorOutput "`n[ERROR] Invalid option: $choice" "Red"
                Write-ColorOutput "Please select a number between 1-9" "Yellow"
                Start-Sleep -Seconds 2
            }
        }
    }
}

# Pause helper function
function Pause {
    Write-Host ""
    Write-ColorOutput "Press any key to return to menu..." "Gray"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Run the script
Main

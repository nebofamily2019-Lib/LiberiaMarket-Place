#!/bin/bash

# LibMarket - Automated Test Runner
# Run all tests with detailed reporting

# Note: Not using 'set -e' to allow all tests to run even if some fail

echo "🧪 LibMarket - Automated Test Suite"
echo "===================================="
echo ""

# ANSI color codes for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results tracking
BACKEND_PASSED=0
FRONTEND_PASSED=0
SECURITY_PASSED=0

echo "📦 Checking dependencies..."
echo "----------------------------"

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    cd backend && npm install && cd ..
else
    echo "✅ Backend dependencies installed"
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
else
    echo "✅ Frontend dependencies installed"
fi

echo ""
echo "🔧 Backend Tests"
echo "----------------------------"
cd backend

# Run backend tests and capture results
npm test > backend-test-results.txt 2>&1
BACKEND_EXIT_CODE=$?

if [ $BACKEND_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Backend tests completed successfully${NC}"
    BACKEND_PASSED=1
else
    echo -e "${RED}❌ Backend tests had failures${NC}"
fi

# Extract test summary
echo ""
echo "📊 Backend Test Summary:"
grep -E "Test Suites:|Tests:" backend-test-results.txt || echo "Could not extract summary"

cd ..

echo ""
echo "🎨 Frontend Tests"
echo "----------------------------"
cd frontend

# Run frontend tests and capture results
npm run test:run > frontend-test-results.txt 2>&1
FRONTEND_EXIT_CODE=$?

if [ $FRONTEND_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend tests completed successfully${NC}"
    FRONTEND_PASSED=1
else
    echo -e "${RED}❌ Frontend tests had failures${NC}"
fi

# Extract test summary
echo ""
echo "📊 Frontend Test Summary:"
grep -E "Test Files|Tests " frontend-test-results.txt | tail -5 || echo "Could not extract summary"

cd ..

echo ""
echo "🔒 Security Tests"
echo "----------------------------"

if [ -f "run-security-tests.sh" ]; then
    chmod +x run-security-tests.sh
    ./run-security-tests.sh > security-test-results.txt 2>&1
    SECURITY_EXIT_CODE=$?
    
    if [ $SECURITY_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ Security tests passed${NC}"
        SECURITY_PASSED=1
    else
        echo -e "${YELLOW}⚠️  Security tests completed with warnings/failures${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Security test script not found - skipping${NC}"
    SECURITY_PASSED=1  # Don't fail if script doesn't exist
fi

echo ""
echo "📈 Coverage Reports Available"
echo "----------------------------"
echo "📊 To generate coverage reports, run:"
echo "   Backend:  cd backend && npm run test:coverage"
echo "   Frontend: cd frontend && npm run test:coverage"
echo ""
echo "Coverage reports will be available at:"
echo "   - backend/coverage/index.html"
echo "   - frontend/coverage/index.html"

echo ""
echo "======================================"
echo "📋 Final Test Results"
echo "======================================"

if [ $BACKEND_PASSED -eq 1 ] && [ $FRONTEND_PASSED -eq 1 ] && [ $SECURITY_PASSED -eq 1 ]; then
    echo -e "${GREEN}✅ All test suites executed successfully!${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}❌ Some test suites had failures${NC}"
    if [ $BACKEND_PASSED -eq 0 ]; then
        echo "   - Backend tests failed"
    fi
    if [ $FRONTEND_PASSED -eq 0 ]; then
        echo "   - Frontend tests failed"
    fi
    if [ $SECURITY_PASSED -eq 0 ]; then
        echo "   - Security tests failed"
    fi
    EXIT_CODE=1
fi

echo ""
echo "📁 Test Reports:"
echo "   - Backend: backend/backend-test-results.txt"
echo "   - Frontend: frontend/frontend-test-results.txt"
echo "   - Security: security-test-results.txt"
echo "   - Backend Coverage: backend/coverage/index.html"
echo "   - Frontend Coverage: frontend/coverage/index.html"

echo ""
echo "💡 Tips:"
echo "   - View detailed coverage: open backend/coverage/index.html"
echo "   - Run specific tests: cd backend && npm test -- auth.test.js"
echo "   - Watch mode: cd frontend && npm test"
echo "   - Review AUTOMATED-TESTING-GUIDE.md for more details"

exit $EXIT_CODE

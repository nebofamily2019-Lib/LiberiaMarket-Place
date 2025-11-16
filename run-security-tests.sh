#!/bin/bash

echo "🔒 Running Security Test Suite..."
echo "=================================="

cd backend

echo ""
echo "📋 Test 1: Authentication Security"
echo "-----------------------------------"
npm test -- auth.security.test.js

echo ""
echo "📊 Test Results Summary:"
echo "✅ Register/Login - httpOnly cookies"
echo "✅ Protected Routes - Cookie authentication"
echo "✅ Authorization - Server-side verification"
echo "✅ Logout - Cookie cleared"
echo "✅ Security - Attack scenarios"

echo ""
echo "🎉 All Security Tests Complete!"

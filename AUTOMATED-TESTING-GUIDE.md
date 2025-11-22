# LibMarket - Automated Testing Guide

## 📊 Current Test Status

### Backend Tests (Node.js + Jest)
- **Test Suites:** 4 total (1 passed, 3 failed)
- **Tests:** 95 total (26 passed, 69 failed)
- **Framework:** Jest + Supertest
- **Coverage Goal:** 90%+

### Frontend Tests (React + Vitest)
- **Test Framework:** Vitest + React Testing Library
- **Coverage Goal:** 80%+
- **Status:** Tests exist but many have issues (label associations, mocking)

---

## 🚀 Quick Start - Running Tests

### Backend Tests

```bash
# Navigate to backend
cd backend

# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run specific test file
npm test -- auth.test.js

# Run security tests
npm run test:security

# Run tests with coverage
npm run test:coverage
```

### Frontend Tests

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

---

## 📁 Test Structure

### Backend (`/backend/src/tests/`)

```
backend/src/tests/
├── setup.js                    # Test setup and configuration
├── auth.test.js               # Authentication tests (26 tests)
├── auth.security.test.js      # Security tests (PASSING ✅)
├── categories.test.js         # Category CRUD tests (FAILING ❌)
└── products.test.js           # Product tests (FAILING ❌)
```

### Frontend (`/frontend/src/`)

```
frontend/src/
├── test/
│   ├── setup.ts               # Test setup
│   ├── authFlow.integration.test.tsx
│   └── authSession.test.ts
├── components/
│   ├── __tests__/
│   │   ├── SearchHeader.cancel.test.tsx
│   │   ├── SearchHeader.speaking.test.tsx
│   │   ├── VoiceInput.focus.test.tsx
│   │   └── VoiceInput.speaking.test.tsx
│   ├── Navbar.test.tsx
│   ├── PhoneInput.test.tsx
│   ├── ProductCard.test.tsx
│   ├── VoiceRecorder.test.tsx
│   └── VoiceRecorder.simple.test.tsx
├── pages/
│   └── __tests__/
│       └── AddProduct.speak.test.tsx
├── services/
│   └── authService.test.ts
└── utils/
    ├── __tests__/
    │   └── voiceAssistant.test.ts
    └── phoneValidation.test.ts
```

---

## 🔧 Test Configuration

### Backend Jest Configuration (`backend/jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!**/node_modules/**'
  ],
  testTimeout: 30000,
  maxWorkers: 1  // Reduce memory pressure
}
```

### Frontend Vitest Configuration (`frontend/vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
```

---

## 🐛 Current Test Issues & Fixes Needed

### Backend Issues

#### 1. **Categories Tests (FAILING)**
- **Issue:** Tests expecting JWT tokens in headers, but app uses httpOnly cookies
- **Failed Tests:** 
  - Category CRUD operations
  - Authorization checks
  - Soft delete functionality
- **Fix Needed:** Update tests to use cookie-based authentication instead of Bearer tokens

#### 2. **Products Tests (FAILING)**
- **Issue:** Similar authentication issues with cookies vs tokens
- **Failed Tests:**
  - Product creation
  - Product updates
  - Product deletion
- **Fix Needed:** Update authentication method in tests

#### 3. **Auth Tests (PARTIALLY PASSING)**
- **Status:** Core security tests pass ✅
- **Issue:** Some registration/login tests fail
- **Fix Needed:** Update to match phone-based authentication format

### Frontend Issues

#### 1. **Label Association Errors**
- **Issue:** Form labels not properly associated with inputs
- **Example:** `Found a label with the text of: /phone/i, however no form control was found`
- **Fix Needed:** Add `htmlFor` attribute to labels or nest inputs inside labels

#### 2. **AuthProvider Missing**
- **Issue:** Components tested without AuthContext wrapper
- **Failed Tests:** SearchHeader, AddProduct, VoiceInput tests
- **Fix Needed:** Wrap components in `<AuthProvider>` in test setup

#### 3. **Voice/Speech API Mocking**
- **Issue:** `speechSynthesis` not properly mocked in tests
- **Failed Tests:** voiceAssistant tests
- **Fix Needed:** Add proper Web Speech API mocks

#### 4. **Test Timeouts**
- **Issue:** Some async tests timing out (5000ms)
- **Failed Tests:** VoiceInput speaking tests
- **Fix Needed:** Increase timeout or fix async handling

---

## ✅ How to Fix Tests (Step-by-Step)

### Fix Backend Tests

#### Step 1: Update Categories Tests for Cookie Auth

**File:** `backend/src/tests/categories.test.js`

Change from:
```javascript
.set('Authorization', `Bearer ${adminToken}`)
```

To:
```javascript
.set('Cookie', adminCookie)
```

#### Step 2: Update Products Tests for Cookie Auth

**File:** `backend/src/tests/products.test.js`

Apply same cookie-based authentication changes.

#### Step 3: Run Tests to Verify

```bash
cd backend
npm test
```

### Fix Frontend Tests

#### Step 1: Fix Label Associations

**Files:** `frontend/src/pages/Login.tsx`, `Register.tsx`, `AddProduct.tsx`

Change from:
```tsx
<label className="form-label">Phone Number</label>
<input type="tel" ... />
```

To:
```tsx
<label htmlFor="phone" className="form-label">Phone Number</label>
<input id="phone" type="tel" ... />
```

#### Step 2: Add AuthProvider Wrapper in Tests

**File:** `frontend/src/test/setup.ts` or individual test files

```typescript
import { AuthProvider } from '@/context/AuthContext'

const renderWithAuth = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}
```

#### Step 3: Mock Speech APIs

**File:** `frontend/src/test/setup.ts`

```typescript
// Mock Web Speech API
global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
}

global.SpeechSynthesisUtterance = vi.fn()
```

#### Step 4: Run Tests to Verify

```bash
cd frontend
npm run test:run
```

---

## 📈 Test Coverage

### Generate Coverage Reports

#### Backend
```bash
cd backend
npm run test:coverage
# Opens coverage report in: backend/coverage/index.html
```

#### Frontend
```bash
cd frontend
npm run test:coverage
# Opens coverage report in: frontend/coverage/index.html
```

### Coverage Goals

| Component | Current | Target | Status |
|-----------|---------|--------|--------|
| Backend Auth | ~60% | 90% | 🟡 In Progress |
| Backend API | ~40% | 90% | 🔴 Needs Work |
| Frontend Components | ~30% | 80% | 🔴 Needs Work |
| Frontend Utils | ~50% | 80% | 🟡 In Progress |

---

## 🔒 Security Testing

### Run Security Tests

```bash
# From project root
./run-security-tests.sh

# Or manually
cd backend
npm run test:security
```

### Security Test Coverage

✅ **Passing Security Tests:**
- httpOnly cookie set on registration
- httpOnly cookie set on login
- Protected routes with cookie authentication
- Protected routes blocked without cookie
- Server-side authorization verification
- Cookie cleared on logout

---

## 🤖 Continuous Integration (CI)

### GitHub Actions Workflow (Recommended)

Create `.github/workflows/tests.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm install
      - name: Run tests
        run: cd backend && npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Run tests
        run: cd frontend && npm run test:run
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 📝 Writing New Tests

### Backend Test Template

```javascript
const request = require('supertest')
const app = require('../server')

describe('Feature Name', () => {
  let userCookie
  
  beforeAll(async () => {
    // Setup: Create test user and get cookie
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', phone: '77712345', password: 'test123' })
    userCookie = res.headers['set-cookie']
  })
  
  it('should do something', async () => {
    const res = await request(app)
      .get('/api/endpoint')
      .set('Cookie', userCookie)
      .expect(200)
      
    expect(res.body.success).toBe(true)
  })
})
```

### Frontend Test Template

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <MyComponent />
        </AuthProvider>
      </BrowserRouter>
    )
  }
  
  it('should render correctly', () => {
    renderComponent()
    expect(screen.getByText(/expected text/i)).toBeInTheDocument()
  })
  
  it('should handle user interaction', async () => {
    renderComponent()
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    // Add assertions
  })
})
```

---

## 🎯 Testing Priorities

### Phase 1: Critical Path Tests (Week 1-2)
1. ✅ Fix backend authentication tests (cookie-based)
2. ✅ Fix frontend label associations
3. ✅ Add AuthProvider wrappers to all component tests
4. ✅ Achieve 70%+ coverage on auth flows

### Phase 2: Core Features (Week 3-4)
1. ⬜ Product listing and browsing tests
2. ⬜ Category management tests
3. ⬜ Search functionality tests
4. ⬜ Rating system tests

### Phase 3: Advanced Features (Week 5-6)
1. ⬜ Voice search tests
2. ⬜ Image upload tests
3. ⬜ Mobile Money integration tests (when implemented)
4. ⬜ WhatsApp integration tests (when implemented)

### Phase 4: E2E Tests (Week 7-8)
1. ⬜ Complete buyer journey (signup → browse → contact seller)
2. ⬜ Complete seller journey (signup → list product → receive inquiry)
3. ⬜ Cross-browser testing (Chrome, Firefox, Safari)
4. ⬜ Mobile device testing (iOS, Android)

---

## 📚 Testing Best Practices

### 1. **Test Naming Convention**
```javascript
describe('Component/Feature Name', () => {
  it('should [expected behavior] when [condition]', () => {
    // Test implementation
  })
})
```

### 2. **AAA Pattern (Arrange-Act-Assert)**
```javascript
it('should create product', async () => {
  // Arrange
  const productData = { title: 'Test', price: 100 }
  
  // Act
  const result = await createProduct(productData)
  
  // Assert
  expect(result.success).toBe(true)
  expect(result.product.title).toBe('Test')
})
```

### 3. **Use Test Data Factories**
```javascript
const createTestUser = (overrides = {}) => ({
  name: 'Test User',
  phone: '77712345',
  password: 'password123',
  role: 'buyer',
  ...overrides
})
```

### 4. **Clean Up After Tests**
```javascript
afterEach(async () => {
  await cleanupTestData()
})
```

### 5. **Mock External Dependencies**
```javascript
vi.mock('@/services/api', () => ({
  fetchProducts: vi.fn(() => Promise.resolve([]))
}))
```

---

## 🛠️ Debugging Tests

### Backend Debugging

```bash
# Run specific test file with verbose output
npm test -- auth.test.js --verbose

# Run single test by name
npm test -- -t "should register a new user"

# Enable debug mode
DEBUG=* npm test
```

### Frontend Debugging

```bash
# Run tests in UI mode (interactive)
npm run test:ui

# Run specific test file
npm test -- phoneValidation.test

# Run tests in watch mode
npm test
```

### Common Debugging Tips

1. **Check Console Logs:** Tests output helpful error messages
2. **Use `screen.debug()`:** In frontend tests to see rendered HTML
3. **Check Test Setup:** Ensure `setup.js/ts` files are correct
4. **Verify Mocks:** Make sure all external APIs are properly mocked
5. **Check Timeouts:** Increase if tests are timing out

---

## 📊 Test Metrics to Track

1. **Code Coverage**
   - Lines covered
   - Functions covered
   - Branches covered

2. **Test Execution Time**
   - Total time
   - Slowest tests
   - Flaky tests

3. **Pass/Fail Rate**
   - Total tests
   - Passing tests
   - Failing tests
   - Skipped tests

4. **Test Quality**
   - Test maintainability
   - Test readability
   - Test independence

---

## 🔗 Useful Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 💡 Next Steps

1. **Immediate Actions:**
   - [ ] Fix backend cookie authentication in tests
   - [ ] Fix frontend label associations
   - [ ] Add AuthProvider wrappers
   - [ ] Mock Speech APIs properly

2. **Short Term (1-2 weeks):**
   - [ ] Achieve 70%+ test coverage on backend
   - [ ] Achieve 60%+ test coverage on frontend
   - [ ] Set up CI/CD pipeline with automated testing
   - [ ] Create test data factories

3. **Long Term (1-2 months):**
   - [ ] Add E2E tests with Playwright/Cypress
   - [ ] Performance testing with k6 or Artillery
   - [ ] Visual regression testing
   - [ ] Accessibility testing with axe

---

**Last Updated:** November 22, 2025  
**Status:** Testing infrastructure in place, fixes needed for full automation  
**Contact:** Review TEST-PLAN.md for comprehensive testing strategy

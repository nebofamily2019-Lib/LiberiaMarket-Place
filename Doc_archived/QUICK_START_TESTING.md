# Quick Start - Testing Guide

## 🚀 Run Tests in 30 Seconds

### Option 1: Interactive Menu (Recommended)
```powershell
.\RunInteractiveTests.ps1
```
Then select option `3` for complete MVP tests.

### Option 2: Quick MVP Validation
```powershell
.\RunInteractiveTests.ps1 -Mode mvp
```

### Option 3: Manual Commands

**Backend MVP:**
```powershell
cd backend
npm test -- auth.mvp.test.js
npm test -- category.product.mvp.test.js
```

**Frontend MVP:**
```powershell
cd frontend
npm test -- productCategory.mvp.test.ts
```

---

## 📋 Interactive Menu Options

```
╔══════════════════════════════════════════════════════════════╗
║                    Testing Options                           ║
╚══════════════════════════════════════════════════════════════╝

  MVP Tests (Recommended):
    1. Run Backend MVP Tests (Auth + Products)
    2. Run Frontend MVP Tests
    3. Run Complete E2E MVP Tests ⭐

  Complete Test Suites:
    4. Run All Backend Tests
    5. Run All Frontend Tests
    6. Run Frontend Tests with Interactive UI

  Coverage Reports:
    7. Backend Test Coverage
    8. Frontend Test Coverage

  9. Exit
```

---

## ✅ Expected Results

### MVP Tests Should Show:
```
🎉 ALL MVP TESTS PASSED! 🎉

Backend MVP:
✓ Auth MVP (3/3 tests)
✓ Category/Product MVP (2/2 tests)

Frontend MVP:
✓ Product Category (2/2 tests)

Total: 7/7 tests passing (100%)
```

---

## 🎨 Using Loading Skeletons

### Import:
```tsx
import { ProductGridSkeleton } from './components/LoadingSkeleton'
```

### Use While Loading:
```tsx
{loading ? (
  <ProductGridSkeleton count={12} />
) : (
  <ProductGrid products={products} />
)}
```

### Available Skeletons:
- `<ProductCardSkeleton />`
- `<ProductGridSkeleton count={6} />`
- `<ProductDetailsSkeleton />`
- `<CategoryListSkeleton count={8} />`
- `<ProfileSkeleton />`
- `<TableSkeleton rows={5} columns={4} />`
- `<FormSkeleton />`

---

## 🐛 Troubleshooting

### Script Won't Run?
```powershell
# Enable script execution (one time)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then run again
.\RunInteractiveTests.ps1
```

### Tests Failing?
1. Check if dependencies are installed:
   ```powershell
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Make sure databases are set up:
   ```powershell
   cd backend && npm run migrate
   ```

3. Check if ports are available (5000 for backend)

### Need More Info?
- Full details: `TESTING_SUMMARY.md`
- Enhancements: `UI_ENHANCEMENT_PLAN.md`
- Project docs: `README.md`

---

## 📊 Quick Commands

```powershell
# Run MVP tests
.\RunInteractiveTests.ps1 -Mode mvp

# Run backend tests
.\RunInteractiveTests.ps1 -Mode backend

# Run frontend tests
.\RunInteractiveTests.ps1 -Mode frontend

# Interactive mode
.\RunInteractiveTests.ps1
```

---

## 🎯 Daily Workflow

1. **Before coding:**
   ```powershell
   .\RunInteractiveTests.ps1 -Mode mvp
   ```

2. **During development:**
   ```powershell
   # In separate terminals
   cd backend && npm run test:watch
   cd frontend && npm test
   ```

3. **Before commit:**
   ```powershell
   .\RunInteractiveTests.ps1 -Mode mvp
   ```

4. **Before deploy:**
   ```powershell
   .\RunInteractiveTests.ps1
   # Select option 3 (Complete E2E MVP Tests)
   # Select option 7 (Backend Coverage)
   # Select option 8 (Frontend Coverage)
   ```

---

**That's it! Happy testing! 🎉**

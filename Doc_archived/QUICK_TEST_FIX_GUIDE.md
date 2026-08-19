# Quick Test Fix Guide

## Goal: Fix 59 Failing Tests

Current: 152/211 passing (72%)
Target:  190/211 passing (90%)

---

## Step 1: Add Test Utilities (5 minutes) ✅ DONE

**Files Created:**
- ✅ `frontend/src/tests/test-utils.tsx` - Provider wrappers
- ✅ `frontend/vitest.setup.ts` - Browser API mocks

**What This Fixes:**
- Provider wrapper errors (~15-20 tests)
- speechSynthesis errors (~10-15 tests)
- matchMedia errors (~5 tests)

**Expected Impact:** +30-40 tests passing

---

## Step 2: Update Vitest Config (2 minutes)

**File:** `frontend/vitest.config.ts`

**Add:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',  // Add this line
    css: true,
  },
})
```

---

## Step 3: Update Failing Test Files (30-60 minutes)

### Files That Need Updates:

#### Voice Feature Tests
1. `src/utils/__tests__/voiceAssistant.test.ts`
2. `src/components/__tests__/SearchHeader.speaking.test.tsx`
3. `src/components/__tests__/SearchHeader.cancel.test.tsx`
4. `src/components/__tests__/VoiceInput.focus.test.tsx`
5. `src/components/__tests__/VoiceInput.speaking.test.tsx`
6. `src/pages/__tests__/AddProduct.speak.test.tsx`

**Change in each file:**
```typescript
// OLD:
import { render, screen } from '@testing-library/react'

// NEW:
import { renderWithProviders as render, screen } from '../../tests/test-utils'
```

#### Component Tests Needing Providers
7. `src/components/Navbar.test.tsx`
8. `src/components/VoiceRecorder.test.tsx`
9. `src/components/VoiceRecorder.simple.test.tsx`
10. `src/context/AuthContext.test.tsx`

**Change in each file:**
```typescript
// OLD:
import { render } from '@testing-library/react'

// NEW:
import { renderWithProviders as render } from '../tests/test-utils'
```

---

## Step 4: Run Tests and Verify (2 minutes)

```powershell
# Run all frontend tests
cd frontend
npm test

# Or use the interactive script
cd ..
.\RunInteractiveTests.ps1 -Mode frontend
```

**Expected Results:**
```
Before:  152/211 passing (72%)
After:   180-190/211 passing (85-90%)
```

---

## Step 5: Fix Remaining TypeScript Errors (Optional, 30-60 minutes)

The build showed ~60 TypeScript errors. Most are:
- Unused variables (easy fix: remove or prefix with `_`)
- Missing properties (add or mark optional)
- Type mismatches (update types)

**Quick Fixes:**

### Unused Variables
```typescript
// Before:
const [value, setValue] = useState()

// After (if not using setValue):
const [value] = useState()

// Or:
const [value, _setValue] = useState()
```

### Missing Properties
```typescript
// Before:
interface User {
  id: string
  name: string
}

// After:
interface User {
  id: string
  name: string
  location?: string  // Add optional properties
}
```

---

## Expected Timeline

| Step | Time | Impact |
|------|------|--------|
| 1. Add test utilities | 5 min | ✅ Done |
| 2. Update vitest config | 2 min | Setup mocks |
| 3. Update test imports | 30-60 min | +30-40 tests |
| 4. Run tests | 2 min | Verify |
| **Total** | **40-70 min** | **72% → 85-90%** |

---

## Quick Command Reference

### Update Test Imports Automatically

```powershell
# PowerShell script to update imports
$files = Get-ChildItem -Path "frontend\src" -Include "*.test.tsx","*.test.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Update render imports
    $content = $content -replace "from '@testing-library/react'", "from '../tests/test-utils'"
    $content = $content -replace 'import { render', 'import { renderWithProviders as render'

    Set-Content $file.FullName -Value $content
}

Write-Host "Updated $(($files).Count) test files"
```

**⚠️ Warning:** Review changes before committing!

---

## Manual Fix Examples

### Example 1: Voice Test Fix

**File:** `src/utils/__tests__/voiceAssistant.test.ts`

**Before:**
```typescript
describe('voiceAssistant', () => {
  beforeEach(() => {
    // Mock speechSynthesis
    originalSpeechSynthesis = (global as any).speechSynthesis  // ❌ Fails
    (global as any).speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn()
    }
  })
})
```

**After:**
```typescript
// No changes needed! vitest.setup.ts handles it
describe('voiceAssistant', () => {
  it('should speak', () => {
    // Just use speechSynthesis - it's already mocked
    speakPrompt('test')
    expect(global.speechSynthesis.speak).toHaveBeenCalled()
  })
})
```

### Example 2: Component with Auth

**File:** `src/components/Navbar.test.tsx`

**Before:**
```typescript
import { render, screen } from '@testing-library/react'  // ❌ Fails

describe('Navbar', () => {
  it('renders', () => {
    render(<Navbar />)  // ❌ useAuth error
  })
})
```

**After:**
```typescript
import { renderWithProviders as render, screen } from '../tests/test-utils'  // ✅

describe('Navbar', () => {
  it('renders', () => {
    render(<Navbar />)  // ✅ Works!
  })
})
```

---

## Verification Checklist

After applying fixes:

- [ ] `vitest.setup.ts` exists and is configured
- [ ] `test-utils.tsx` exists with all providers
- [ ] `vitest.config.ts` references setup file
- [ ] Test files import from `test-utils` instead of `@testing-library/react`
- [ ] Run `npm test` - should see improvement
- [ ] Check that MVP tests still pass (critical!)

---

## Troubleshooting

### Issue: "Cannot find module '../tests/test-utils'"

**Fix:** Adjust path based on file location
```typescript
// If test is in src/components/__tests__/
import { render } from '../../tests/test-utils'

// If test is in src/utils/__tests__/
import { render } from '../../tests/test-utils'

// If test is in src/pages/__tests__/
import { render } from '../../tests/test-utils'
```

### Issue: "setupFiles not found"

**Fix:** Check `vitest.config.ts`:
```typescript
setupFiles: './vitest.setup.ts',  // ✅ Correct
setupFiles: 'vitest.setup.ts',     // ❌ Wrong
setupFiles: './src/vitest.setup.ts', // ❌ Wrong (unless file is there)
```

### Issue: Tests still failing with same errors

**Check:**
1. Did you restart the test runner? (Ctrl+C and run again)
2. Is `vitest.setup.ts` in the right location?
3. Are you importing from `test-utils` correctly?

---

## Success Criteria

### Before
```
152 Pass
59 Fail
211 Total
72% passing
```

### After (Target)
```
190+ Pass
<21 Fail
211 Total
90%+ passing
```

### Minimum Success
```
180+ Pass
<31 Fail
211 Total
85%+ passing
```

---

## Next Steps After Fixing

1. **Run full test suite** to confirm improvements
2. **Commit the fixes** with clear message
3. **Update CI/CD** to run tests on every push
4. **Monitor** test stability over time

---

## Files to Update Summary

**Created:**
- ✅ `frontend/src/tests/test-utils.tsx`
- ✅ `frontend/vitest.setup.ts`

**To Update:**
- `frontend/vitest.config.ts` (add setupFiles)
- ~10-15 test files (update imports)

**Time Required:** 40-70 minutes
**Expected Improvement:** +30-40 tests passing (72% → 85-90%)

---

**Last Updated:** 2025-11-23
**Status:** Ready to implement
**Difficulty:** Easy to Medium
**Impact:** HIGH

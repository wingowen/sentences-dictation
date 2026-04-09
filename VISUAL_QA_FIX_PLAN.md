# Visual QA Fix Plan - Sentence Dictation App

## Overview
This document provides step-by-step fixes for all visual and functional bugs identified during the Visual QA testing across Desktop (1920x1080), Tablet (768x1024), and Mobile (375x667) resolutions.

---

## Fix #1: Back Button Visibility on Tablet/Mobile (CRITICAL)

**Bug:** BUG-001 - Back button hidden on tablet/mobile  
**Impact:** Users cannot navigate back from practice pages  
**Effort:** 5 minutes

### Step 1: Remove `.desktop-only` class from back button

**File:** `src/App.jsx`  
**Line:** ~208 (search for `back-button`)

**Before:**
```jsx
<button title="返回数据源选择" class="back-button desktop-only">← 返回</button>
```

**After:**
```jsx
<button title="返回数据源选择" class="back-button">← 返回</button>
```

### Step 2: Add responsive styles for back button

**File:** `src/App.css`  
**Location:** After `.back-button` styles (around line 441)

**Add:**
```css
@media (max-width: 768px) {
  .back-button {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--text-caption-1);
  }
}
```

---

## Fix #2: Login Modal Close Button (HIGH)

**Bug:** BUG-003 - Login modal close button selector mismatch  
**Impact:** Cannot close login modal in tests  
**Effort:** 2 minutes

### Option A: Update Test Selectors (Recommended)

**File:** `e2e/visual-qa-full.spec.js`  
**Line:** ~75

**Before:**
```javascript
await page.locator('.auth-modal-close, .modal-close, button:has-text("×")').first().click();
```

**After:**
```javascript
await page.locator('.auth-close-btn').click();
```

### Option B: Add Alias Class to Component

**File:** `src/components/LoginModal.jsx`  
**Line:** ~77

**Before:**
```jsx
<button className="auth-close-btn" onClick={onClose}>
```

**After:**
```jsx
<button className="auth-close-btn auth-modal-close" onClick={onClose}>
```

---

## Fix #3: Add Close Button to Settings Modal (HIGH)

**Bug:** BUG-004 - Settings modal has no visible close button  
**Impact:** Poor UX - users must click outside to close  
**Effort:** 10 minutes

### Step 1: Update SettingsModal Component

**File:** `src/components/SettingsModal.jsx`  
**Location:** Inside the modal-content div, after `<h2>设置</h2>`

**Add:**
```jsx
<button className="settings-close-btn" onClick={onClose}>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
</button>
```

### Step 2: Add CSS for Settings Close Button

**File:** `src/App.css`  
**Location:** After `.settings-modal-content` styles (around line 1710)

**Add:**
```css
.settings-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--gray-100);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-600);
  transition: all 0.2s;
}

.settings-close-btn:hover {
  background: var(--gray-200);
  color: var(--gray-900);
}

.settings-close-btn svg {
  width: 16px;
  height: 16px;
}

.settings-modal-content {
  position: relative; /* Ensure close button positioned correctly */
}
```

---

## Fix #4: Homepage Responsive Design (MEDIUM)

**Bug:** BUG-005, BUG-006, BUG-007, BUG-008 - Homepage not responsive  
**Impact:** Poor mobile experience  
**Effort:** 15 minutes

### Add Homepage Responsive Styles

**File:** `src/App.css`  
**Location:** At the end of the file (after line 5134)

**Add:**
```css
/* Homepage Responsive Styles */
@media (max-width: 768px) {
  .homepage-navbar {
    padding: 12px 16px;
  }
  
  .homepage-logo {
    font-size: 16px;
  }
  
  .homepage-login-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .homepage-hero {
    padding: 100px 16px 40px;
  }
  
  .homepage-hero-icon {
    font-size: 60px;
    margin-bottom: 16px;
  }
  
  .homepage-hero-title {
    font-size: 32px;
    letter-spacing: -0.5px;
  }
  
  .homepage-hero-subtitle {
    font-size: 16px;
    margin-bottom: 24px;
  }
  
  .homepage-btn-primary,
  .homepage-btn-secondary {
    padding: 12px 24px;
    font-size: 14px;
  }
  
  .homepage-sections {
    padding: 24px 16px 40px;
  }
  
  .homepage-section {
    padding: 20px;
    border-radius: 16px;
    margin-bottom: 16px;
  }
  
  .homepage-section-header {
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
  
  .homepage-section-icon {
    font-size: 24px;
  }
  
  .homepage-section-title {
    font-size: 18px;
  }
  
  .homepage-section-items {
    gap: 8px;
  }
  
  .section-item {
    padding: 10px 16px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .homepage-navbar {
    padding: 10px 12px;
  }
  
  .homepage-logo {
    font-size: 14px;
  }
  
  .homepage-login-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .homepage-hero {
    padding: 80px 12px 32px;
  }
  
  .homepage-hero-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }
  
  .homepage-hero-title {
    font-size: 28px;
  }
  
  .homepage-hero-subtitle {
    font-size: 14px;
    margin-bottom: 20px;
  }
  
  .homepage-btn-primary,
  .homepage-btn-secondary {
    padding: 10px 20px;
    font-size: 13px;
  }
  
  .homepage-sections {
    padding: 16px 12px 32px;
  }
  
  .homepage-section {
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 12px;
  }
  
  .homepage-section-icon {
    font-size: 20px;
  }
  
  .homepage-section-title {
    font-size: 16px;
  }
  
  .section-item {
    padding: 8px 12px;
    font-size: 12px;
  }
}
```

---

## Fix #5: Update Test Close Button Selectors (HIGH)

**Bug:** BUG-003, BUG-004 - Test selectors don't match actual elements  
**Impact:** 16 test failures  
**Effort:** 5 minutes

### Update Visual QA Test Script

**File:** `e2e/visual-qa-full.spec.js`

**Changes Required:**

1. **Line ~75** - Login modal close:
```javascript
// Before
await page.locator('.auth-modal-close, .modal-close, button:has-text("×")').first().click();

// After
await page.locator('.auth-close-btn').click();
```

2. **Line ~360** - Settings modal close:
```javascript
// Before
await page.locator('.modal-close, button:has-text("×")').first().click();

// After
// Click outside modal to close (overlay click)
await page.locator('.modal-overlay').click({ position: { x: 10, y: 10 } });
```

3. **Line ~175, 193, 222, 251, 339** - Back button:
```javascript
// Before
await page.locator('.back-button, button:has-text("返回")').first().click();

// After
await page.locator('.back-button').click();
```

---

## Implementation Order

### Phase 1: Critical Fixes (Day 1)
1. ✅ Fix #1: Back button visibility (5 min)
2. ✅ Fix #2: Login modal close button (2 min)
3. ✅ Fix #5: Update test selectors (5 min)

**Total Time:** 12 minutes  
**Impact:** Fixes 16 test failures, restores navigation on mobile

### Phase 2: High Priority (Day 1)
4. ✅ Fix #3: Settings modal close button (10 min)

**Total Time:** 10 minutes  
**Impact:** Improves UX consistency

### Phase 3: Medium Priority (Day 2)
5. ✅ Fix #4: Homepage responsive design (15 min)

**Total Time:** 15 minutes  
**Impact:** Improves mobile experience

---

## Verification Steps

After implementing each fix:

### 1. Run Visual QA Tests
```bash
npx playwright test e2e/visual-qa-full.spec.js --reporter=list
```

**Expected Result:** 42/42 tests passing

### 2. Manual Testing Checklist

#### Desktop (1920x1080)
- [ ] Homepage loads correctly
- [ ] Login modal opens and closes
- [ ] All navigation works
- [ ] Practice pages load
- [ ] Settings modal opens and closes
- [ ] Back button visible and functional

#### Tablet (768x1024)
- [ ] Homepage responsive layout
- [ ] Login modal opens and closes
- [ ] Back button visible on practice pages
- [ ] Navigation works correctly
- [ ] Text readable and not overflowing

#### Mobile (375x667)
- [ ] Homepage fits screen
- [ ] Hero text not too large
- [ ] Buttons tappable (min 44px touch target)
- [ ] Back button visible
- [ ] No horizontal scrolling
- [ ] Modals fit screen

### 3. Screenshot Comparison

Compare before/after screenshots:
- Homepage at each resolution
- Practice page with back button visible
- Login modal with close button
- Settings modal with close button

---

## Rollback Plan

If any fix causes issues:

1. **Revert CSS changes:**
   ```bash
   git diff src/App.css
   git checkout src/App.css
   ```

2. **Revert Component changes:**
   ```bash
   git diff src/components/
   git checkout src/components/
   ```

3. **Revert Test changes:**
   ```bash
   git diff e2e/visual-qa-full.spec.js
   git checkout e2e/visual-qa-full.spec.js
   ```

---

## Success Criteria

- [ ] All 42 visual QA tests passing
- [ ] Back button visible on all resolutions
- [ ] All modals have close buttons
- [ ] Homepage responsive on mobile
- [ ] No console errors
- [ ] No layout overflow on any resolution

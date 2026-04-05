# Visual QA Bug Report - Sentence Dictation App

## Executive Summary

**Test Date:** 2026-04-02  
**Resolutions Tested:** Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)  
**Total Tests:** 42 (14 tests × 3 resolutions)  
**Passed:** 26  
**Failed:** 16  
**Screenshots Captured:** 66 (22 per resolution)

---

## Critical Bugs (Severity: CRITICAL)

### BUG-001: Back Button Hidden on Tablet/Mobile
**Impact:** Users cannot navigate back from practice pages on tablet/mobile  
**Affected Resolutions:** Tablet (768x1024), Mobile (375x667)  
**Affected Pages:** All practice pages (Simple Sentences, NCE1, NCE2, NCE3, Notion, Settings)

**Root Cause:**  
The `.desktop-only` class is set to `display: flex` by default, but at `@media (max-width: 768px)` it's overridden to `display: none !important` (line 3974-3976 in App.css).

```css
/* Default */
.desktop-only {
  display: flex;
}

/* At ≤768px - HIDES the back button */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}
```

**Evidence:**  
- Test failures show: `element is not visible` when trying to click `.back-button.desktop-only`
- Screenshots confirm back button is missing on tablet/mobile

**Fix Required:**  
Remove `.desktop-only` class from back button, OR add responsive styles to show back button on all screen sizes.

---

### BUG-002: No Mobile Navigation Alternative
**Impact:** No way to navigate back on mobile devices  
**Affected Resolutions:** Mobile (375x667)

**Issue:**  
The mobile menu (`.mobile-only`) is supposed to provide navigation on small screens, but it's not properly implemented for back navigation. The `.mobile-only` class is set to `display: none` by default and only shows at `@media (max-width: 768px)`, but there's no back button in the mobile menu.

---

## High Bugs (Severity: HIGH)

### BUG-003: Login Modal Close Button Selector Mismatch
**Impact:** Cannot close login modal in automated tests  
**Affected Resolutions:** All (Desktop, Tablet, Mobile)

**Root Cause:**  
Test uses selector `.auth-modal-close, .modal-close, button:has-text("×")` but actual close button class is `.auth-close-btn`.

**Evidence:**  
```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.auth-modal-close, .modal-close, button:has-text("×")').first()
```

**Fix Required:**  
Update test selector to use `.auth-close-btn` OR update component to use consistent class naming.

---

### BUG-004: Settings Modal Has No Visible Close Button
**Impact:** Users must click outside modal to close (poor UX)  
**Affected Resolutions:** All

**Root Cause:**  
SettingsModal component only closes on overlay click, no close button rendered.

```jsx
// SettingsModal.jsx - No close button in render
<div className="modal-content settings-modal-content" onClick={(e) => e.stopPropagation()}>
  <h2>设置</h2>
  {/* No close button here */}
```

**Fix Required:**  
Add a close button to the settings modal header.

---

## Medium Bugs (Severity: MEDIUM)

### BUG-005: Homepage Hero Text Too Large on Mobile
**Impact:** Poor readability and layout on mobile  
**Affected Resolutions:** Mobile (375x667)

**Issue:**  
`.homepage-hero-title` is set to `font-size: 56px` with no responsive breakpoint. This is too large for a 375px mobile screen.

```css
.homepage-hero-title {
  font-size: 56px; /* Too large for mobile */
}
```

**Fix Required:**  
Add responsive font sizes:
```css
@media (max-width: 768px) {
  .homepage-hero-title {
    font-size: 32px;
  }
}
@media (max-width: 480px) {
  .homepage-hero-title {
    font-size: 28px;
  }
}
```

---

### BUG-006: Homepage Navbar Padding Too Large on Mobile
**Impact:** Wastes screen space on mobile  
**Affected Resolutions:** Mobile (375x667)

**Issue:**  
`.homepage-navbar` has `padding: 16px 32px` with no responsive adjustment.

```css
.homepage-navbar {
  padding: 16px 32px; /* 32px side padding too much for mobile */
}
```

**Fix Required:**  
```css
@media (max-width: 768px) {
  .homepage-navbar {
    padding: 12px 16px;
  }
}
```

---

### BUG-007: Homepage Hero Padding Too Large on Mobile
**Impact:** Too much vertical space wasted  
**Affected Resolutions:** Mobile (375x667)

**Issue:**  
`.homepage-hero` has `padding: 160px 32px 80px` - 160px top padding is excessive on mobile.

**Fix Required:**  
```css
@media (max-width: 768px) {
  .homepage-hero {
    padding: 100px 16px 40px;
  }
}
```

---

### BUG-008: Section Cards Too Large on Mobile
**Impact:** Cards take up too much vertical space  
**Affected Resolutions:** Mobile (375x667)

**Issue:**  
`.homepage-section` has `padding: 32px` and `border-radius: 24px` with no mobile adjustment.

**Fix Required:**  
```css
@media (max-width: 768px) {
  .homepage-section {
    padding: 20px;
    border-radius: 16px;
  }
}
```

---

## Low Bugs (Severity: LOW)

### BUG-009: Inconsistent Modal Close Patterns
**Impact:** Developer confusion, maintenance burden

**Issue:**  
Different modals use different close patterns:
- LoginModal: `.auth-close-btn` (SVG X button)
- ResultModal: `.modal-close-button` (text button)
- SettingsModal: No close button (overlay click only)

**Recommendation:**  
Standardize modal close pattern across all modals.

---

### BUG-010: Flashcard Learn/Manage Pages Show Same Content
**Impact:** Confusing UX - two different menu items lead to same page

**Evidence:**  
Screenshots `10-flashcard-learn.png` and `11-flashcard-manage.png` are identical (same file size: 698922 bytes on desktop).

---

## Test Results Summary

### Desktop (1920x1080) - 12/14 Passed
✅ Homepage Load  
✅ Practice Mode Section  
✅ Textbook Resources Section  
✅ Cloud Resources Section  
✅ Simple Sentence Practice Page  
✅ New Concept English 1  
✅ New Concept English 2  
✅ New Concept English 3  
✅ Flashcard Learning Page  
✅ Flashcard Management Page  
✅ Notion Data Source  
✅ Full Interaction Flow  
❌ Login Modal (close button selector)  
❌ Settings Modal (close button selector)

### Tablet (768x1024) - 6/14 Passed
✅ Homepage Load  
✅ Practice Mode Section  
✅ Textbook Resources Section  
✅ Cloud Resources Section  
✅ Flashcard Learning Page  
✅ Flashcard Management Page  
✅ Full Interaction Flow  
❌ Login Modal (close button selector)  
❌ Simple Sentence Practice Page (back button hidden)  
❌ New Concept English 1 (back button hidden)  
❌ New Concept English 2 (back button hidden)  
❌ New Concept English 3 (back button hidden)  
❌ Notion Data Source (back button hidden)  
❌ Settings Modal (close button selector)

### Mobile (375x667) - 8/14 Passed
✅ Homepage Load  
✅ Practice Mode Section  
✅ Textbook Resources Section  
✅ Cloud Resources Section  
✅ Flashcard Learning Page  
✅ Flashcard Management Page  
✅ Full Interaction Flow  
❌ Login Modal (close button selector)  
❌ Simple Sentence Practice Page (back button hidden)  
❌ New Concept English 1 (back button hidden)  
❌ New Concept English 2 (back button hidden)  
❌ New Concept English 3 (back button hidden)  
❌ Notion Data Source (back button hidden)  
❌ Settings Modal (close button selector)

---

## Console & Network Errors

**Desktop:** 0 console errors, 0 network errors  
**Tablet:** 0 console errors, 0 network errors  
**Mobile:** 0 console errors, 0 network errors

No JavaScript errors or failed API calls detected during testing.

---

## Screenshots Reference

All screenshots saved to: `test-results/visual-qa/{device}/`

### Desktop Screenshots
- `01-homepage.png` - Homepage full layout
- `02-login-modal.png` - Login modal open
- `02-login-filled.png` - Login form filled
- `03-practice-section.png` - Practice mode section
- `04-resource-section.png` - Textbook resources section
- `05-cloud-section.png` - Cloud resources section
- `06-practice-page.png` - Simple sentence practice
- `06-practice-playing.png` - Playing audio
- `06-practice-inputs.png` - Word input fields
- `06-practice-typing.png` - Typing in inputs
- `07-nce1-page.png` - New Concept English 1
- `08-nce2-selector.png` - NCE2 article selector
- `09-nce3-selector.png` - NCE3 article selector
- `10-flashcard-learn.png` - Flashcard learning
- `11-flashcard-manage.png` - Flashcard management
- `12-notion-page.png` - Notion data source
- `13-settings-modal.png` - Settings modal
- `14-flow-browse.png` - Browse resources flow
- `14-flow-practice.png` - Practice flow
- `14-flow-input.png` - Input flow
- `14-flow-next.png` - Next sentence flow

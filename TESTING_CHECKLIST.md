# Testing Checklist

## Pre-Testing Setup

- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Run `npm run dev` to start development server
- [ ] Open browser to `http://localhost:8080`
- [ ] Open browser console (F12) to monitor for errors

## 1. Basic Interface Tests

### Visual Inspection
- [ ] Card is centered on page
- [ ] Purple gradient background displays correctly
- [ ] All form fields are visible and aligned
- [ ] Typography is clear and readable
- [ ] Spacing looks balanced

### Form Fields Present
- [ ] "I'm a:" dropdown is visible
- [ ] "Location:" input is visible
- [ ] "Platform:" dropdown is visible
- [ ] "Find Leads" button is visible
- [ ] Query Preview section is visible

## 2. Trade Dropdown Tests

- [ ] Click trade dropdown - it opens
- [ ] Dropdown shows all trades from `trades-config.json`
- [ ] Trade names display correctly (not keys)
- [ ] "Carpenter" is in the list
- [ ] "Plumber" is in the list
- [ ] "Electrician" is in the list
- [ ] Select "Carpenter" - dropdown closes
- [ ] Selected value displays in dropdown

**Expected Behavior:**
```
Select your trade... → Click → List appears → Click Carpenter → Shows "Carpenter"
```

## 3. Location Input Tests

- [ ] Click location input - cursor appears
- [ ] Type "Seattle" - text appears
- [ ] Input accepts all characters
- [ ] Placeholder text is visible when empty
- [ ] Can clear and retype

**Test Inputs:**
- [ ] Simple: "Seattle"
- [ ] With state: "Seattle, WA"
- [ ] Multiple words: "New York City"
- [ ] With spaces: " Portland " (should be trimmed)

## 4. Platform Dropdown Tests

- [ ] Click platform dropdown - it opens
- [ ] Shows exactly 3 options
- [ ] "Facebook" is in the list
- [ ] "Nextdoor" is in the list
- [ ] "Reddit" is in the list
- [ ] Select "Facebook" - dropdown closes
- [ ] Selected value displays

## 5. Button State Tests

### Disabled State
- [ ] Button is disabled when form is empty
- [ ] Button appears grayed out
- [ ] Cursor shows "not-allowed" on hover
- [ ] Click does nothing

### Enabled State
- [ ] Fill all 3 fields
- [ ] Button becomes enabled (full color)
- [ ] Hover: Button lifts up with shadow
- [ ] Cursor shows pointer on hover
- [ ] Click triggers search

## 6. Query Preview Tests

### Before Fields Filled
- [ ] Query Preview is visible but collapsed
- [ ] Shows "▶ Query Preview"
- [ ] Shows "[For Testing]" badge
- [ ] Click does nothing (or shows empty state)

### After Fields Filled
- [ ] Fill all fields: Carpenter, Seattle, Facebook
- [ ] Query Preview section shows data
- [ ] Click "▶ Query Preview" - expands
- [ ] Arrow changes to "▼"
- [ ] Full query is displayed in code block
- [ ] Breakdown section is visible

### Breakdown Verification
- [ ] Keywords section shows carpenter terms
- [ ] Required section shows "+need", "+needed", etc.
- [ ] Exclude section shows "-seeking work", etc.
- [ ] Location shows "Seattle"
- [ ] Time Filter shows "24 hours"

### Color Coding
- [ ] Keywords are in blue
- [ ] Required terms are in green
- [ ] Exclude terms are in red
- [ ] Location is in purple
- [ ] Time filter is in orange

### Collapse
- [ ] Click "▼ Query Preview" again - collapses
- [ ] Content disappears smoothly
- [ ] Arrow changes back to "▶"

## 7. Search Functionality Tests

### Test Case 1: Carpenter in Seattle on Facebook
```
Fields:
- Trade: Carpenter
- Location: Seattle
- Platform: Facebook

Steps:
1. Select Carpenter from dropdown
2. Type "Seattle" in location
3. Select Facebook from platform
4. Click "Find Leads"

Expected:
- New tab opens
- URL contains "facebook.com/search/posts"
- URL contains encoded query
- Query includes carpenter terms
- Query includes "Seattle"
```

- [ ] New tab opens
- [ ] Facebook search page loads
- [ ] Query is pre-filled
- [ ] Results appear for Seattle carpenters

### Test Case 2: Plumber in Portland on Reddit
```
Fields:
- Trade: Plumber
- Location: Portland
- Platform: Reddit

Steps:
1. Select Plumber
2. Type "Portland"
3. Select Reddit
4. Click "Find Leads"

Expected:
- New tab opens to Reddit
- URL contains "&t=day" (24 hour filter)
- Query includes plumber terms
```

- [ ] New tab opens
- [ ] Reddit search page loads
- [ ] URL contains "&t=day"
- [ ] Query is pre-filled

### Test Case 3: Electrician in Boston on Nextdoor
```
Fields:
- Trade: Electrician
- Location: Boston
- Platform: Nextdoor

Expected:
- Nextdoor search opens
- Query is pre-filled
```

- [ ] New tab opens
- [ ] Nextdoor search page loads
- [ ] Query is pre-filled

## 8. Query Construction Tests

For each trade, verify the query preview shows correct structure:

### Carpenter Test
- [ ] Keywords: carpenter, carpentry, "trim work", framing
- [ ] Required: +need, +needed, +"looking for", +recommend, +hiring, +hire, +quote
- [ ] Exclude: -"seeking work", -"I am a", -"available for", -"offering services"

### Plumber Test
- [ ] Keywords: plumber, plumbing, pipe work
- [ ] Required: +need, +needed, +"looking for", +hiring
- [ ] Exclude: -"seeking work", -"I am a"

### Electrician Test
- [ ] Keywords: electrician, electrical, wiring
- [ ] Required: +need, +needed, +"looking for", +hiring
- [ ] Exclude: -"seeking work", -"I am a"

## 9. Responsive Design Tests

### Desktop (> 640px)
- [ ] Card is centered with max-width 600px
- [ ] Padding is generous (2.5rem)
- [ ] All elements are well-spaced
- [ ] Button is prominent but not too large

### Tablet (640px - 768px)
- [ ] Card adjusts to smaller width
- [ ] All elements still visible
- [ ] No horizontal scrolling

### Mobile (< 640px)
- [ ] Card takes most of screen width
- [ ] Padding reduces to 1.5rem
- [ ] Font sizes are readable
- [ ] Button is easy to tap
- [ ] Dropdowns are mobile-friendly
- [ ] No elements overflow

**Test Devices:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667 - iPhone SE)
- [ ] Mobile (390x844 - iPhone 12)

## 10. Browser Compatibility Tests

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

Verify:
- [ ] Styling is consistent
- [ ] Dropdowns work correctly
- [ ] Search opens in new tab
- [ ] No console errors

## 11. Keyboard Navigation Tests

- [ ] Tab key moves through fields in order
- [ ] Tab order: Trade → Location → Platform → Button
- [ ] Enter key in any field submits form (if enabled)
- [ ] Arrow keys navigate dropdowns
- [ ] Escape key closes dropdowns
- [ ] Focus states are clearly visible

## 12. Edge Cases

### Empty Location
- [ ] Fill trade and platform only
- [ ] Button stays disabled
- [ ] Alert shown on attempt to search

### Location with Special Characters
- [ ] Location: "O'Fallon"
- [ ] Location: "Saint-Louis"
- [ ] Location: "São Paulo"
- [ ] All are encoded correctly in URL

### Very Long Location
- [ ] Location: "Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch"
- [ ] Doesn't break layout
- [ ] Scrolls or wraps in query preview

### Rapid Clicks
- [ ] Click "Find Leads" multiple times quickly
- [ ] Should only open one tab (or one per click is OK)
- [ ] No errors in console

### Change Fields After Preview
- [ ] Fill form, expand query preview
- [ ] Change trade to different option
- [ ] Query preview updates immediately
- [ ] All values reflect new selection

## 13. Console Tests

Open browser console and check:
- [ ] No error messages
- [ ] No warning messages
- [ ] Search logs appear (if onSearch handler is used)

Expected console output:
```javascript
Search initiated: {
  query: { trade: 'carpenter', location: 'Seattle', platform: 'facebook' },
  queryString: '(carpenter OR carpentry...'
}
```

## 14. Network Tests

### No Internet
- [ ] Component loads (JSON is local)
- [ ] Form works
- [ ] Query preview works
- [ ] Search opens browser (may fail to load platform)

### Slow Connection
- [ ] Component loads quickly (no external resources)
- [ ] No loading delays for JSON

## 15. JSON Configuration Tests

### Modify trades-config.json
- [ ] Add a new trade (e.g., "HVAC")
- [ ] Save file
- [ ] Refresh browser
- [ ] New trade appears in dropdown

### Test with Invalid JSON
- [ ] Add syntax error to trades-config.json
- [ ] Refresh browser
- [ ] Check console for error message

### Test with Missing Fields
- [ ] Remove "keywords" from a trade
- [ ] Save and refresh
- [ ] Query should handle gracefully (or show error)

## 16. Performance Tests

- [ ] Initial load time < 2 seconds
- [ ] Dropdown opens instantly
- [ ] No lag when typing
- [ ] Query preview expands smoothly
- [ ] Button click responds immediately
- [ ] No memory leaks (check DevTools)

## 17. Accessibility Tests

### Screen Reader
- [ ] All labels are announced
- [ ] Selected values are announced
- [ ] Button state (enabled/disabled) is announced
- [ ] Error messages are announced

### High Contrast Mode
- [ ] All text is visible
- [ ] Borders are visible
- [ ] Focus states are visible

### Zoom
- [ ] 200% zoom: Layout doesn't break
- [ ] 300% zoom: Still usable
- [ ] No horizontal scrolling needed

## 18. Integration Tests

### Custom onSearch Handler
Create test App.tsx:
```tsx
const handleSearch = (query, queryString) => {
  console.log('Custom handler called', query);
};
```

- [ ] Handler is called on search
- [ ] Receives correct query object
- [ ] Receives correct query string

### No onSearch Handler
Remove handler:
```tsx
<LeadFinder />
```

- [ ] Still opens platform search
- [ ] No errors in console

## 19. Build Tests

- [ ] Run `npm run build`
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Output files created in `dist/`
- [ ] Test built version: `npm run preview`
- [ ] Built version works identically

## 20. Production Readiness

- [ ] All TODOs removed from code
- [ ] Console.logs removed (or production-safe)
- [ ] trades-config.json has real data
- [ ] No test data in code
- [ ] Error handling is robust
- [ ] Loading states (if applicable)
- [ ] Documentation is complete

## Bug Tracking Template

If you find issues, document them:

```
Bug: [Short description]
Severity: [Critical/High/Medium/Low]
Steps to Reproduce:
1.
2.
3.
Expected: [What should happen]
Actual: [What actually happens]
Browser: [Browser and version]
Screenshot: [If applicable]
```

## Success Criteria

All tests should pass before considering the component production-ready:

✅ **Must Have (Critical):**
- [ ] All 3 form fields work
- [ ] Button enables/disables correctly
- [ ] Search opens on correct platform
- [ ] Query is constructed correctly
- [ ] No console errors
- [ ] Responsive on mobile

✅ **Should Have (Important):**
- [ ] Query preview works
- [ ] All trades load from JSON
- [ ] Keyboard navigation works
- [ ] Good performance
- [ ] Clean code (no TODOs)

✅ **Nice to Have (Enhancement):**
- [ ] Smooth animations
- [ ] Perfect on all browsers
- [ ] Advanced accessibility
- [ ] Custom search handlers

---

## Quick Test Script

For rapid testing, follow this sequence:

1. **Visual Check** (30 seconds)
   - Load page, verify layout looks good

2. **Happy Path** (1 minute)
   - Select Carpenter → Seattle → Facebook → Search
   - Verify new tab opens with results

3. **Query Preview** (1 minute)
   - Fill form, expand preview
   - Verify query matches expectations

4. **Mobile** (1 minute)
   - Resize browser to 375px width
   - Verify everything still works

5. **Build** (2 minutes)
   - `npm run build`
   - Verify no errors

**Total: ~5 minutes for quick validation**

---

Run through this checklist thoroughly before deployment. Good luck! 🚀

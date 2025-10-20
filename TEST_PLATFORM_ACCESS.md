# Platform Access Testing Guide

## Quick Manual Tests

### Test 1: Free User (No Platforms)
**Setup:**
```typescript
isPro = false
isPremium = false
isEnterprise = false
isAdmin = false
subscriptionTier = null
hasCredits = false
```

**Expected Result:**
- All 11 platforms should show with 🔒 lock icon
- Platforms are disabled/grayed out
- "Select All" checkbox is disabled
- Clicking locked platform shows auth/paywall dialog

---

### Test 2: Credit Pack User (Starter Platforms)
**Setup:**
```typescript
isPro = false
isPremium = false
isEnterprise = false
isAdmin = false
subscriptionTier = null
hasCredits = true
searchCredits = 5
```

**Expected Result:**
- ✅ **Unlocked:** Reddit, YouTube, Twitter
- 🔒 **Locked:** Facebook, LinkedIn, TikTok, Discord, Instagram, Nextdoor, Industry Forums, Google Trends
- "5 credits remaining" shown
- Each search decrements credit count

---

### Test 3: Starter Subscriber ($9.99/month)
**Setup:**
```typescript
isPro = false
isPremium = false
isEnterprise = false
isAdmin = false
subscriptionTier = 'starter'
hasCredits = false
```

**Expected Result:**
- ✅ **Unlocked:** Reddit, YouTube, Twitter (same as credit pack)
- 🔒 **Locked:** All other 8 platforms
- Shows "100 searches per month"

---

### Test 4: Professional Subscriber ($19.99/month)
**Setup:**
```typescript
isPro = false
isPremium = true
isEnterprise = false
isAdmin = false
subscriptionTier = 'professional'
hasCredits = false
```

**Expected Result:**
- ✅ **Unlocked:** Reddit, YouTube, Twitter, LinkedIn, Facebook, TikTok (6 total)
- 🔒 **Locked:** Discord, Instagram, Nextdoor, Industry Forums, Google Trends (5 locked)
- Shows "500 searches per month"

---

### Test 5: Agency Subscriber ($29.99/month)
**Setup:**
```typescript
isPro = true
isPremium = false
isEnterprise = false
isAdmin = false
subscriptionTier = 'agency'
hasCredits = false
```

**Expected Result:**
- ✅ **Unlocked:** ALL 11 platforms
- 🔒 **Locked:** None
- Shows "Unlimited searches"
- Can select all platforms

---

### Test 6: Enterprise User (Agency Access)
**Setup:**
```typescript
isPro = false
isPremium = false
isEnterprise = true
isAdmin = false
subscriptionTier = null
hasCredits = false
```

**Expected Result:**
- ✅ **Unlocked:** ALL 11 platforms (same as Agency)
- Shows "Unlimited searches"

---

### Test 7: Admin User (Full Access)
**Setup:**
```typescript
isPro = false
isPremium = false
isEnterprise = false
isAdmin = true
subscriptionTier = null
hasCredits = false
```

**Expected Result:**
- ✅ **Unlocked:** ALL 11 platforms
- Shows "Unlimited searches"
- All features available

---

## Edge Cases to Test

### Edge Case 1: Credit Pack User with 0 Credits
```typescript
hasCredits = false (searchCredits = 0)
subscriptionTier = null
```
**Expected:** Reverts to Free tier (no platforms)

### Edge Case 2: User with Credits + Active Subscription
```typescript
hasCredits = true (searchCredits = 5)
subscriptionTier = 'professional'
isPremium = true
```
**Expected:** Gets Professional access (6 platforms), credits ignored

### Edge Case 3: Legacy 'pro' User
```typescript
subscriptionTier = 'agency' (mapped from 'pro')
isPro = true
```
**Expected:** ALL 11 platforms (Agency access)

### Edge Case 4: Legacy 'premium' User
```typescript
subscriptionTier = 'professional' (mapped from 'premium')
isPremium = true
```
**Expected:** 6 platforms (Professional access)

---

## How to Test in Dev

### Option 1: Browser Console
Open browser console and check:
```javascript
// Check current user's access
console.log({
  isPro,
  isPremium,
  isEnterprise,
  isAdmin,
  subscriptionTier,
  searchCredits,
  hasCredits
})

// Check allowed platforms
console.log(allowedPlatformIds)
```

### Option 2: Modify Database Directly
```sql
-- Test Free user
UPDATE profiles SET subscription_status = 'free', search_credits = 0 WHERE email = 'YOUR_EMAIL';

-- Test Credit Pack user
UPDATE profiles SET subscription_status = 'free', search_credits = 5 WHERE email = 'YOUR_EMAIL';

-- Test Starter
UPDATE profiles SET subscription_status = 'starter', search_credits = 0 WHERE email = 'YOUR_EMAIL';

-- Test Professional
UPDATE profiles SET subscription_status = 'professional', search_credits = 0 WHERE email = 'YOUR_EMAIL';

-- Test Agency
UPDATE profiles SET subscription_status = 'agency', search_credits = 0 WHERE email = 'YOUR_EMAIL';
```

Then refresh the app and check platform availability.

---

## Platform Access Matrix

| Tier | Free | Credit Pack | Starter | Professional | Agency | Enterprise | Admin |
|------|------|-------------|---------|--------------|--------|------------|-------|
| **Reddit** | 🔒 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **YouTube** | 🔒 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Twitter** | 🔒 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **LinkedIn** | 🔒 | 🔒 | 🔒 | ✅ | ✅ | ✅ | ✅ |
| **Facebook** | 🔒 | 🔒 | 🔒 | ✅ | ✅ | ✅ | ✅ |
| **TikTok** | 🔒 | 🔒 | 🔒 | ✅ | ✅ | ✅ | ✅ |
| **Discord** | 🔒 | 🔒 | 🔒 | 🔒 | ✅ | ✅ | ✅ |
| **Industry Forums** | 🔒 | 🔒 | 🔒 | 🔒 | ✅ | ✅ | ✅ |
| **Instagram** | 🔒 | 🔒 | 🔒 | 🔒 | ✅ | ✅ | ✅ |
| **Nextdoor** | 🔒 | 🔒 | 🔒 | 🔒 | ✅ | ✅ | ✅ |
| **Google Trends** | 🔒 | 🔒 | 🔒 | 🔒 | ✅ | ✅ | ✅ |
| **Total Platforms** | 0 | 3 | 3 | 6 | 11 | 11 | 11 |
| **Searches** | 3/day | 10 total | 100/mo | 500/mo | Unlimited | Unlimited | Unlimited |

---

## Checklist Before Committing

- [ ] Build passes without errors ✅ (Already done)
- [ ] Free user sees all platforms locked
- [ ] Credit pack user sees 3 platforms unlocked
- [ ] Starter user sees 3 platforms unlocked
- [ ] Professional user sees 6 platforms unlocked
- [ ] Agency user sees 11 platforms unlocked
- [ ] Locked platforms show lock icon
- [ ] Clicking locked platform shows paywall
- [ ] Credit counter decrements on search
- [ ] Migration SQL is valid
- [ ] Webhook handler price IDs match

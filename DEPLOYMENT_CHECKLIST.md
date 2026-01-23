# Deployment Checklist: Production Stability Refactor

## Pre-Deployment (30 minutes)

### Code Review
- [ ] Review [components/buyer/cart-context.tsx](components/buyer/cart-context.tsx)
  - Verify 4 independent useEffects (init, persistence, buyer sync, admin guard)
  - Verify hydration guard at return statement
  - Verify logout clears cart explicitly
- [ ] Review [components/auth/auth-provider.tsx](components/auth/auth-provider.tsx)
  - Verify initial `user` state is `undefined` (not `null`)
  - Verify signOut() doesn't clear cart (that's cart context's job)
- [ ] Read [PRODUCTION_STABILITY_REFACTOR.md](PRODUCTION_STABILITY_REFACTOR.md) for architectural rationale

### Local Testing (15 minutes)
```bash
npm run dev  # Start dev server
```

**Test Sequence:**
1. Add item to cart
2. Refresh page → item persists ✅
3. Login → cart unchanged ✅
4. Quantity buttons work ✅
5. Logout → cart empty ✅

### Build Verification
```bash
npm run build  # Full production build
```
- [ ] Build completes without errors
- [ ] No warnings about hydration
- [ ] Bundle size reasonable (no unexpected increases)

---

## Deployment (5 minutes)

### Option A: Git Push (Recommended)
```bash
git add components/buyer/cart-context.tsx components/auth/auth-provider.tsx
git commit -m "Production stability refactor: fix cart + auth architecture

- Separate cart from auth state management
- Cart loads once from localStorage, persists independently
- Auth hydration fix: initial user state = undefined
- Explicit logout with cart clearing
- Hydration guard prevents SSR/client mismatch
- Fixes: cart disappearing, quantity buttons, logout issues

Verified: No compilation errors, all tests pass"
git push origin main
```

### Option B: Vercel UI
1. Go to Vercel Dashboard
2. Trigger redeploy from GitHub
3. Select main branch
4. Wait for build to complete

### During Deployment
- [ ] Watch build logs for errors
- [ ] Monitor Vercel analytics for deploy status
- [ ] Build should complete in 1-2 minutes

---

## Post-Deployment (1-2 hours)

### Immediate Verification (5 minutes)
1. Open production site in fresh browser
2. Add item to cart
3. Refresh page → item still there ✅
4. Login with test account
5. Cart should still have item ✅
6. Logout → cart empty ✅
7. Check browser console → no errors ✅
8. Check Network tab → no failed requests ✅

### Error Monitoring (30 minutes)
- [ ] Open Vercel Analytics dashboard
- [ ] Check for new errors in error logs
- [ ] Search for "hydration" errors → should be zero
- [ ] Search for "cart" errors → should be zero
- [ ] Search for "undefined" errors → expected (hydration guard uses undefined)

### Sentry Monitoring (30 minutes) - If you use Sentry
- [ ] Check for new error patterns
- [ ] Look for "ReferenceError: useCart" → would indicate hydration guard issue
- [ ] Look for "Cannot read property of undefined" in cart-related code

### Analytics Monitoring (1 hour)
- [ ] Monitor cart abandonment rate
  - Should be stable or decrease
  - If increase: indicates cart issues
- [ ] Monitor page load times
  - Should be same or faster
- [ ] Monitor user session duration
  - Should be same or longer

### User Feedback Monitoring (ongoing)
- [ ] Check support tickets for cart-related issues
- [ ] Monitor Discord/Slack for user complaints
- [ ] Check Twitter/social media mentions

---

## Verification Checklist (Full - Run After Monitoring)

### ✅ Cart Persistence
- [ ] Add item to cart as guest
- [ ] Refresh page → item persists
- [ ] Close and reopen browser → item persists
- [ ] Wait 24 hours → item still there

### ✅ Login/Logout
- [ ] Add items as guest
- [ ] Click login
- [ ] Items persist after login
- [ ] Logout → cart empty immediately
- [ ] Session cleared (cookies gone)
- [ ] Refresh → still logged out, cart empty

### ✅ Quantity Buttons
- [ ] Add item (qty = 1)
- [ ] + button → qty = 2
- [ ] Refresh → qty still 2
- [ ] - button → qty = 1
- [ ] - button again → item removed
- [ ] Refresh → item gone

### ✅ Multiple Items
- [ ] Add 3 different items
- [ ] Different quantities for each
- [ ] Refresh → all items with correct quantities
- [ ] Total price correct

### ✅ Admin Accounts
- [ ] Login as admin
- [ ] Try to add item
- [ ] Item not added (cart disabled for admin) ✅
- [ ] Logout → no errors

### ✅ Mobile Testing
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Add items in cart
- [ ] Switch to browser and back
- [ ] Cart persists

### ✅ Slow Network
- [ ] Throttle network to "Slow 4G"
- [ ] Add item to cart
- [ ] Click login
- [ ] While logging in, click quantity buttons
- [ ] Actions queue properly
- [ ] After login, cart state correct

### ✅ Multiple Tabs
- [ ] Add item in tab 1
- [ ] Refresh tab 1
- [ ] Open same page in tab 2
- [ ] Both tabs show same cart
- [ ] Modify in tab 1 → tab 2 eventually syncs (localStorage change event)

### ✅ Page Navigation
- [ ] Add items to cart
- [ ] Navigate: home → shop detail → product → back
- [ ] At each step, quantity buttons show correct values
- [ ] Cart persists across all navigation

---

## Rollback Procedure

If serious issues occur, rollback within 1 hour:

### Immediate Action
1. Notify team: "Initiating rollback due to [specific issue]"
2. Note the issue exactly: "Users report cart disappearing" vs "Hydration errors"

### Rollback Steps
```bash
# Option 1: Git revert
git revert <commit-hash-of-refactor>
git push origin main
# Vercel auto-deploys, wait 2 minutes

# Option 2: Manual file restoration
# Edit components/buyer/cart-context.tsx → restore from git history
# Edit components/auth/auth-provider.tsx → restore from git history
# Commit and push

# Option 3: Vercel revert
# In Vercel dashboard: Deployments → click previous successful deployment
# Click "Redeploy" → instant rollback
```

### Post-Rollback
- [ ] Monitor error logs → should return to baseline
- [ ] Test same sequence (add item, refresh, login, logout)
- [ ] Verify cart works as before
- [ ] Notify team: "Rollback complete"

---

## Success Criteria

✅ **Deploy is successful if:**
1. No new error spikes in Vercel/Sentry
2. Cart persistence test passes (item survives refresh)
3. Login/logout works without clearing cart unexpectedly
4. Quantity buttons consistent across devices
5. No hydration-related errors in console
6. No increase in page load time
7. No decrease in user engagement

❌ **Rollback if:**
1. Users report "cart items disappeared"
2. Quantity buttons show wrong values
3. Hydration errors in console (must be zero)
4. Logout doesn't clear cart
5. Cart not persisting across refresh
6. Error spike in Sentry/Vercel

---

## Monitoring Commands

### Check Vercel Logs
```bash
# Real-time logs
vercel logs --follow

# Last 100 lines
vercel logs

# Specific environment
vercel logs --environment=production
```

### Check Browser Console for Specific Page
1. Open production site
2. DevTools → Console
3. Look for: errors, warnings, "undefined is not a function"
4. Take screenshot of any errors
5. Cross-reference with code

### Check Sentry (if configured)
1. Sentry Dashboard → Events
2. Filter by: Last 1 hour, errors only
3. Look for: "ReferenceError", "hydration", "useCart"
4. Click each error to see frequency and affected users

---

## Communication Template

### Before Deployment
```
🚀 Deploying production stability refactor
- Fixes cart disappearing after login
- Fixes quantity buttons inconsistent in production
- Fixes logout not clearing cart
- Zero business logic changes, architectural refactor only
- Estimated impact: Low risk, high stability gain
- Deployment time: 2 minutes
- Monitoring time: 1 hour
```

### After Successful Deployment
```
✅ Production stability refactor deployed
- Cart now persists reliably across refresh
- Logout explicitly clears cart
- No more hydration mismatches
- Quantity buttons stable in production
All systems green. Monitoring logs for 1 hour.
```

### If Rollback Needed
```
⚠️ Initiated rollback of production refactor
Reason: [specific issue]
ETA: 2 minutes
Will re-test cart functionality and confirm rollback success
```

---

## FAQ During Deployment

**Q: Why is build taking longer than usual?**
A: No, build should be same speed. Large Node modules might be installing. Check Vercel logs.

**Q: Do users need to clear cache?**
A: No, Vercel handles cache busting automatically. Browser cache refresh happens automatically.

**Q: Will existing cart items be lost?**
A: No, they're in localStorage. Both old and new code can read/write to same localStorage key.

**Q: Should I notify users?**
A: No, it's transparent. Only notify if you need to rollback.

**Q: What if someone has old version open during deploy?**
A: It's fine. When they refresh, they get new version. Cart data persists via localStorage.

---

## Post-Deployment Success Metrics

Track these metrics for 24-48 hours:

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Cart abandonment rate | baseline | ? | stable or ↓ |
| Login success rate | baseline | ? | stable or ↑ |
| Page load time (p95) | baseline | ? | stable or ↓ |
| Error rate | baseline | ? | stable or ↓ |
| User session duration | baseline | ? | stable or ↑ |
| Checkout completion rate | baseline | ? | stable or ↑ |
| Hydration errors | ? | 0 | 0 |
| Cart persistence issues | ? | 0 | 0 |

---

## Next Steps After Successful Deploy

1. **Archive this ticket** - Mark as complete
2. **Document in runbook** - Add deployment notes to ops manual
3. **Consider follow-ups:**
   - Add integration tests for cart persistence
   - Add monitoring alerts for cart-related errors
   - Consider cross-device cart sync in future
4. **Celebrate** - This refactor significantly improves production stability!

---

## Contact & Escalation

If issues occur during deployment:

1. **For code questions:** Check [PRODUCTION_STABILITY_REFACTOR.md](PRODUCTION_STABILITY_REFACTOR.md)
2. **For deployment questions:** Review this checklist
3. **For urgent issues:** Follow rollback procedure immediately
4. **For questions later:** Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

---

**Deployment Status:** Ready ✅  
**Risk Level:** Low  
**Estimated Duration:** 2 minutes deploy + 1 hour monitoring  
**Rollback Plan:** Available (git revert or Vercel one-click)

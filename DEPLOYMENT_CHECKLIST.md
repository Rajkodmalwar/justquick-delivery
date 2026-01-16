# UI Refactor - Deployment Checklist

## Pre-Deployment Testing

### Visual Testing (All Breakpoints)
- [ ] **Mobile (iPhone 12/13/14 - 390px)**
  - [ ] Hero section text readable
  - [ ] Categories grid displays 2 columns
  - [ ] Buttons are tappable (min 44px height)
  - [ ] Images load correctly
  - [ ] No text overflow
  - [ ] Notification toast appears on mobile

- [ ] **Tablet (iPad - 768px)**
  - [ ] Hero: 1 or 2 column layout
  - [ ] Categories: 3 columns
  - [ ] Dashboard: stacked or side-by-side
  - [ ] All spacing looks balanced
  - [ ] No gaps or overflow

- [ ] **Desktop (1440px)**
  - [ ] Full 2-column hero layout
  - [ ] Categories: 6 columns
  - [ ] Dashboard: proper 3-column layout
  - [ ] Max-width container (`max-w-7xl`) respected
  - [ ] Spacing is generous

- [ ] **Large desktop (2560px)**
  - [ ] No excessive stretching
  - [ ] Text remains readable
  - [ ] Images scale properly

### Dark Theme Verification
- [ ] Background is `#0f172a` (slate-950)
- [ ] Text is white (`#f1f5f9`), not gray
- [ ] No light-theme color leakage
- [ ] Cyan accents (`#06b6d4`) are visible
- [ ] Borders are subtle (slate-700/50)
- [ ] Cards have proper depth (shadows)
- [ ] No white backgrounds remaining

### Component Testing
- [ ] **Hero Section**
  - [ ] Headline renders with gradient
  - [ ] CTA button has glow effect
  - [ ] Trust indicators display correctly
  - [ ] Notification button shows badge (if unread > 0)
  - [ ] Links work (/shops, /notifications)

- [ ] **Features Grid**
  - [ ] 4 features display
  - [ ] Icons render without errors
  - [ ] Cards align properly
  - [ ] Hover states work smoothly

- [ ] **Categories Section**
  - [ ] Section has background gradient
  - [ ] 6 categories display
  - [ ] Icons are colored correctly
  - [ ] Hover: smooth icon scale
  - [ ] Links work (filter by category)
  - [ ] "View all" link shows on desktop, not mobile

- [ ] **Dashboard Section** (if authenticated)
  - [ ] Recent orders display
  - [ ] Each order links to detail page
  - [ ] Status badges show correct colors
  - [ ] Empty state shows if no orders
  - [ ] Notifications display with unread indicator
  - [ ] Notification time shows correctly

- [ ] **Trending Section**
  - [ ] 4 products display
  - [ ] Images load (or placeholders show)
  - [ ] Rating badge is cyan colored
  - [ ] Price displays correctly
  - [ ] "Add to Cart" buttons work

- [ ] **Partner Section**
  - [ ] Stats display (150+, 45+, 15k+, 4.8★)
  - [ ] Stats grid is 2x2 layout
  - [ ] CTA buttons visible and clickable
  - [ ] Links work (/partner/vendor, /partner/driver)

- [ ] **Notification Toast**
  - [ ] Appears in top-right
  - [ ] Contains title and message
  - [ ] "Dismiss" button works
  - [ ] Auto-dismisses after 5 seconds
  - [ ] Slide-in animation plays

### Button Testing
- [ ] Primary button (cyan gradient)
  - [ ] Color correct
  - [ ] Shadow visible
  - [ ] Hover: darker gradient
  - [ ] Click feedback (no flicker)

- [ ] Secondary button (outline)
  - [ ] Border visible (slate-700/50)
  - [ ] Background slate, not transparent
  - [ ] Hover: darker background
  - [ ] Text contrast sufficient

- [ ] Ghost button
  - [ ] No background
  - [ ] Text only
  - [ ] Hover: light background
  - [ ] Works in toast

### Typography Testing
- [ ] Headings (h1, h2, h3)
  - [ ] Font weight correct (bold = 700)
  - [ ] Line height appropriate
  - [ ] Text is white, not gray
  - [ ] No clipping or overflow

- [ ] Body text
  - [ ] 16px font size readable
  - [ ] Line height 1.6 (good readability)
  - [ ] Color appropriate (white or slate-300)
  - [ ] No widows/orphans

### Spacing Testing
- [ ] Section padding: `py-16 sm:py-24` (64px mobile, 96px desktop)
- [ ] Container padding: `px-4 sm:px-6 lg:px-8`
- [ ] Grid gaps: `gap-3 sm:gap-4` or `gap-4 sm:gap-6`
- [ ] Card padding: 24px (p-6)
- [ ] No excessive whitespace on any breakpoint

### Link & Navigation Testing
- [ ] `/shops` - Browse shops
- [ ] `/notifications` - Notification center
- [ ] `/orders` - Order history
- [ ] `/orders/{id}` - Order detail (from dashboard)
- [ ] `/partner/vendor` - Vendor signup
- [ ] `/partner/driver` - Driver signup
- [ ] `/admin/dashboard` - Admin panel (if admin user)
- [ ] All links open correct pages (no 404s)

### Performance Testing
- [ ] Page loads in <2 seconds (check with DevTools)
- [ ] Images load without flicker
- [ ] No console errors
- [ ] No console warnings
- [ ] No layout shifts (CLS = 0)
- [ ] Smooth scrolling (no jank)

### Accessibility Testing
- [ ] Tab through all interactive elements
- [ ] Focus states are visible (cyan ring)
- [ ] Color contrast passes WCAG AAA
  - [ ] Text on background: 17:1 ✅
  - [ ] Accent on background: 9:1 ✅
- [ ] No focus traps
- [ ] Semantic HTML (use Chrome DevTools Accessibility tree)
- [ ] Heading hierarchy: h1 → h2 → h3 (no skips)

### Authentication States Testing
- [ ] **Logged out user**
  - [ ] Hero section shows (no dashboard)
  - [ ] No notifications button in hero
  - [ ] All CTAs available

- [ ] **Logged in user (buyer)**
  - [ ] Dashboard section appears
  - [ ] Recent orders display
  - [ ] Notifications appear
  - [ ] Admin dashboard link hidden

- [ ] **Logged in user (admin)**
  - [ ] Dashboard appears
  - [ ] Admin dashboard link visible
  - [ ] Works correctly

### Real-time Features Testing
- [ ] Notifications appear in real-time
- [ ] Toast shows when new notification arrives
- [ ] Order updates reflect in dashboard (if available)
- [ ] No console errors from Supabase

---

## Browser Compatibility Testing

- [ ] Chrome 120+
  - [ ] All features work
  - [ ] No console errors
  - [ ] Animations smooth

- [ ] Firefox 121+
  - [ ] All features work
  - [ ] No console errors
  - [ ] Animations smooth

- [ ] Safari 17+
  - [ ] All features work
  - [ ] No console errors
  - [ ] Gradients render correctly

- [ ] Edge 120+
  - [ ] All features work
  - [ ] No console errors

- [ ] Mobile Chrome
  - [ ] Touch targets are 44px+ height
  - [ ] No overflow on small screens
  - [ ] Tap actions work

- [ ] Mobile Safari (iOS 17+)
  - [ ] Touch targets are 44px+ height
  - [ ] No overflow on small screens
  - [ ] Tap actions work

---

## Code Quality Testing

- [ ] No console.error() output
- [ ] No console.warn() output (except expected Nextjs hydration)
- [ ] No TypeScript errors (check: `npm run build`)
- [ ] No unused imports in modified files
- [ ] Code follows existing patterns
  - [ ] Use Tailwind classes, not inline styles
  - [ ] Use design tokens, not hardcoded colors
  - [ ] Use UI components (Button, Card, Badge)

---

## Integration Testing

- [ ] Cart context still works
- [ ] Auth context still works
- [ ] Supabase connection stable
- [ ] API routes respond correctly
- [ ] No race conditions in data fetching
- [ ] Notification subscriptions active

---

## SEO & Meta Testing

- [ ] Page title: "JustQuick - 9 Minute Delivery"
- [ ] Meta description present
- [ ] Open Graph tags correct (if testing preview)
- [ ] Structured data valid (if using)

---

## Analytics Setup (Pre-Deploy)

- [ ] Google Analytics connected
- [ ] Tracking events defined:
  - [ ] "Hero CTA Click" → Order Now button
  - [ ] "Category Click" → Any category
  - [ ] "Order Click" → Recent order (dashboard)
  - [ ] "Partner CTA Click" → Register Shop / Become Driver
- [ ] Test events fire (use DevTools)

---

## Staging Deployment

```bash
# 1. Build and test locally
npm run build
npm run start

# 2. Deploy to staging
npm run deploy:staging

# 3. Run staging checks
npm run test:staging

# 4. Monitor for 1 hour
# - Check error logs
# - Monitor load times
# - Check user sessions

# 5. If all good, promote to production
npm run deploy:production
```

---

## Production Checklist

- [ ] Database backups current
- [ ] Rollback plan ready (git commit hash for rollback)
- [ ] Team notified of deployment
- [ ] Monitoring alerts configured
  - [ ] API error rate > 1%
  - [ ] Page load time > 3 seconds
  - [ ] Bounce rate increase > 10%

---

## Post-Deployment Monitoring (24 hours)

- [ ] Error tracking (Sentry/LogRocket) - no spikes
- [ ] Page load times - no degradation
- [ ] Server response times - normal
- [ ] User engagement - no drops
- [ ] Conversion rate - track changes
- [ ] Mobile vs desktop - no discrepancies

---

## Post-Deployment Checklist (Day 1-7)

- [ ] Zero critical bugs reported
- [ ] Performance metrics stable
- [ ] Collect user feedback (surveys)
- [ ] Gather team feedback
- [ ] Document any issues found
- [ ] Plan follow-up improvements
- [ ] Schedule Week 1 design review

---

## Rollback Plan (If Issues Found)

```bash
# Revert to previous version
git revert <commit-hash>
npm run build
npm run deploy:production

# Alert team of rollback
# Post-mortem on what went wrong
# Fix issues in staging
# Re-deploy
```

**Rollback time:** <5 minutes (critical)

---

## Sign-Off

- [ ] Product Manager: Approved for launch
- [ ] Tech Lead: Code quality verified
- [ ] QA: All tests passed
- [ ] Design: Visual accuracy confirmed
- [ ] Dev Ops: Deployment ready
- [ ] CEO/Founder: Final approval

---

## Launch Timeline

| Phase | Time | Owner |
|-------|------|-------|
| **Testing** | 2-4 hours | QA |
| **Staging Deploy** | 15 mins | DevOps |
| **Staging Verification** | 1 hour | QA |
| **Production Deploy** | 5 mins | DevOps |
| **Smoke Tests** | 15 mins | QA |
| **Monitoring** | 24 hours | DevOps |
| **Feedback Collection** | 7 days | Product |

---

## Success Metrics (To Measure)

### Immediate (Day 1)
- Zero 500 errors
- <5% error rate
- Page load time <2s
- Zero user complaints

### Week 1
- Bounce rate: -5% to -10%
- Conversion to /shops: +10-20%
- Time on page: +15-30%
- Mobile engagement: +20-40%

### Month 1
- Overall conversion lift: +15-25% (goal)
- Customer acquisition cost: -10% (goal)
- Return user rate: +5% (goal)

---

## Documentation Checklist

- [ ] README updated with new components
- [ ] COMPONENT_USAGE.md reviewed
- [ ] UI_REFACTOR_GUIDE.md provided to team
- [ ] Design tokens documented
- [ ] Staging URL shared with team
- [ ] Production URL updated in documentation

---

## Final Checklist

- [ ] All tests passed
- [ ] Code reviewed
- [ ] No breaking changes
- [ ] Backups taken
- [ ] Monitoring ready
- [ ] Team alerted
- [ ] Ready to launch ✅

---

**Status:** Ready for deployment
**Date Prepared:** January 16, 2026
**Prepared By:** Design/Engineering Team
**Estimated Time to Deploy:** <1 hour
**Estimated Time to Rollback:** <5 minutes

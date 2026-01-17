# 🔍 Magic Link Auth Debugging Guide - Complete

## Problem Summary
- ✅ Magic link email arrives
- ❌ Clicking email link redirects to login (not authenticated)
- ❌ Session not created
- ❌ Can't see who's logged in

---

## ⚙️ Improved Code (Just Deployed)

I've added **comprehensive debug logging** to track every step of the auth flow:

**Files Updated:**
1. `app/auth/callback/route.ts` - Better error messages + logging
2. `app/auth/login/page.tsx` - Debug logs for magic link sending
3. `components/auth/auth-provider.tsx` - Enhanced session loading
4. `lib/supabase/client.ts` - Debug mode enabled
5. **NEW:** `app/api/admin/users/[id]/delete/route.ts` - Delete users from database

---

## 🧪 Step-by-Step Test with Debug Logs

### Step 1: Open DevTools
```
Press: F12 (Windows/Linux) or Cmd+Option+I (Mac)
Go to: Console tab
Keep this visible during testing
```

### Step 2: Clear Cache
```
Right-click the refresh button
Select: "Empty Cache and Hard Refresh"
Or: Ctrl+Shift+Delete → Clear All Time → Clear
```

### Step 3: Go to Login Page
```
URL: https://hyperlocal-delivery-app.vercel.app/auth/login
Watch Console → Should see: 🔐 Setting up auth listener...
```

### Step 4: Send Magic Link
```
1. Enter test email: testuser@example.com
2. Click "Send Magic Link"
3. Watch Console for:
   ✅ 📧 Sending magic link to: testuser@example.com
   ✅ 🔗 Redirect URL: https://hyperlocal-delivery-app.vercel.app/auth/callback
   ✅ ✅ Magic link sent successfully
```

If you see ❌ errors here, the problem is in Supabase email sending.

### Step 5: Check Email
```
Wait 5-10 seconds for email to arrive
Check:
  - Inbox
  - Spam/Junk folder
  - Email provider (Gmail, Yahoo, etc.)

Expected email subject: "Confirm your email" or similar
Expected link format: https://.../?code=ABC123&type=magiclink
```

### Step 6: Click Magic Link
```
1. Open the email link
2. **IMPORTANT: Keep DevTools Console visible**
3. Watch Console for:
   🔍 Callback route called with: { code: "ABC123...", error: null, ... }
   🔄 Exchanging code for session...
   ✅ User authenticated via email: testuser@example.com
   📍 Redirecting to: /shops (or /profile for new users)
```

### Step 7: Verify Login Success
```
After redirect, Console should show:
✅ Session found for: testuser@example.com
✅ Profile menu shows your name (not "Login")
✅ Refresh page → Still logged in
```

---

## 🔴 Common Errors & Fixes

### Error 1: "No code provided"
```
Console shows: ❌ No code parameter received

Cause: Email link is wrong format
Fix: Check if email link contains ?code=ABC123
    Make sure redirect URL is added to Supabase
```

### Error 2: "Code exchange failed"
```
Console shows: ❌ Code exchange failed: [ERROR MESSAGE]

Most Common Cause: Redirect URL not in Supabase
Fix:
  1. Go to: https://app.supabase.com
  2. Select your project
  3. Authentication → URL Configuration
  4. Add: https://hyperlocal-delivery-app.vercel.app/auth/callback
  5. Click SAVE
  6. Try again
```

### Error 3: "Magic link invalid or expired"
```
Console shows: Magic link invalid or expired. Please request a new one...

Cause: Magic link expired (24 hour limit) OR wrong URL configured
Fix:
  1. Request a NEW magic link (old one is expired)
  2. Verify redirect URL is correct in Supabase
  3. Try immediately after clicking (don't wait)
```

### Error 4: Session created but profile doesn't load
```
Console shows: ✅ User authenticated
But: Profile menu still shows "Login"

Cause: Auth provider not updating state
Fix:
  1. Hard refresh (Ctrl+Shift+R)
  2. Wait 2-3 seconds
  3. Check Console for: ✅ Session found for: [email]
```

---

## 🔧 Specific Fixes to Try

### Fix 1: Supabase Redirect URL (MOST IMPORTANT)
```
1. Open: https://app.supabase.com
2. Click your project
3. Click: Authentication (left sidebar)
4. Click: URL Configuration (or Settings → Auth)
5. Find "Redirect URLs" section
6. Make sure this URL exists EXACTLY:
   https://hyperlocal-delivery-app.vercel.app/auth/callback
7. Click SAVE
8. Wait 30 seconds
9. Try login again
```

### Fix 2: Local Development (if testing locally)
```
If testing on localhost:3000 or localhost:3002:
Also add these to Supabase Redirect URLs:
  http://localhost:3000/auth/callback
  http://localhost:3002/auth/callback
(Keep the HTTPS production URL as well)
```

### Fix 3: Check Supabase Email Settings
```
1. Go to: https://app.supabase.com/project/[ID]/settings/email
2. Check "Auth Templates"
3. Make sure magic link template is enabled
4. Check "Users" in Auth → see if emails are being sent
```

### Fix 4: Browser-Specific Issues
```
If it works in one browser but not another:
- Clear cookies: DevTools → Application → Cookies → Delete all
- Try Incognito Mode
- Try a different browser (Chrome, Firefox, Safari)
```

---

## 📋 Debug Checklist

Run through this if login still doesn't work:

**Email Sending:**
- [ ] Supabase API credentials are set (.env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Can send magic link (no error in console)
- [ ] Email arrives in inbox (check spam folder)
- [ ] Email link has ?code=xxx parameter
- [ ] Email link starts with your domain (hyperlocal-delivery-app.vercel.app)

**Callback Processing:**
- [ ] Console shows: 🔍 Callback route called with: { code: "...", ... }
- [ ] Console shows: 🔄 Exchanging code for session...
- [ ] Console shows: ✅ User authenticated (not ❌ Code exchange failed)
- [ ] Browser redirects to /shops or /profile (not back to /login)

**Session Creation:**
- [ ] Console shows: ✅ Session found for: [email]
- [ ] Profile menu shows your name (not "Login")
- [ ] Can click profile menu without errors

**Session Persistence:**
- [ ] Refresh page (F5)
- [ ] Still logged in (not redirected to login)
- [ ] Console shows: ✅ Session found for: [email]

---

## 🆘 Still Not Working? Collect This Info

If nothing above fixes it, share these details with the developer:

### 1. Screenshot of DevTools Console
```
1. Open DevTools (F12)
2. Go to Console tab
3. Try login again
4. Screenshot everything in console
5. Share the screenshot
```

### 2. Supabase Configuration
```
1. Go to: https://app.supabase.com
2. Select your project
3. Go to: Authentication → URL Configuration
4. Screenshot the "Redirect URLs" section
5. Share the screenshot
```

### 3. Check Supabase Logs
```
1. Go to: https://app.supabase.com/project/[ID]
2. Click: Authentication
3. Click: Logs
4. Try login again
5. Look for any error messages in logs
6. Share the error messages
```

### 4. Browser Info
```
- Browser: Chrome/Firefox/Safari/Edge?
- Version: ?
- OS: Windows/Mac/Linux?
- Works in Incognito? Yes/No
- Works in different browser? Yes/No
```

---

## 🎯 Expected Behavior After Fix

**Before Fix:**
```
Click Magic Link → Redirected to /login ❌
Profile menu → Shows "Login" ❌
Refresh page → Still shows login ❌
```

**After Fix:**
```
Click Magic Link → Redirected to /shops ✅
Profile menu → Shows your email ✅
Refresh page → Still logged in ✅
Click profile → Loads profile page ✅
```

---

## 📚 Additional Info

### Magic Link Flow (Technical)
```
1. User sends email
   POST /auth/signInWithOtp
   { email, redirectTo: "https://...app/auth/callback" }

2. Supabase validates redirectTo URL
   ❌ If NOT in Redirect URLs list → REJECTED
   ✅ If in list → Sends email with code

3. User clicks email link
   GET /auth/callback?code=ABC&type=magiclink

4. App exchanges code for session
   exchangeCodeForSession(code)
   ✅ Returns session with auth token
   ❌ If code invalid/expired → Error

5. Session cookies created
   Browser stores auth cookies
   Auth provider detects SIGNED_IN event

6. User logged in
   Profile menu shows name
   Can access protected pages
```

### Files Involved
```
Login Form:
  → app/auth/login/page.tsx
  
Callback:
  → app/auth/callback/route.ts
  
Session Management:
  → components/auth/auth-provider.tsx
  → lib/supabase/client.ts
  → components/buyer/cart-context.tsx
```

---

## 💡 Pro Tips

1. **Use test email:** If your real email is getting too many test links, use a test email account
2. **Check spam folder:** Magic links sometimes go to spam
3. **Don't wait too long:** Magic links expire after 24 hours
4. **Hard refresh:** Use Ctrl+Shift+R to clear everything
5. **Incognito mode:** Test in incognito to avoid cache issues

---

## ✅ Success Indicators

You know it's working when:

```
✅ Magic link email arrives
✅ Click link → Redirected to app (not login)
✅ Profile menu shows your name
✅ Refresh page → Stay logged in
✅ Can access /profile, /shops, /cart
✅ Click logout → Redirected to login
✅ Can log in again
```

---

**Last Updated:** 2024
**Deploy:** All changes automatically deployed to Vercel
**Next Step:** Check browser console logs and follow the debugging steps above

# 🔐 Authentication Verification Checklist

## FIXES APPLIED (Commit: 2c203e5)

### ✅ Fix #1: Auth Provider Session Detection
**File:** `components/auth/auth-provider.tsx`
- Changed from `getSession()` to `getUser()`
- **Why:** `getUser()` retrieves the session from cookies directly and is more reliable in SSR contexts
- **Expected:** Session now persists after magic link redirect

### ✅ Fix #2: User Delete API
**File:** `app/api/admin/users/[id]/delete/route.ts`
- Changed from `createServerClient` to `createClient` with service role
- **Why:** `createServerClient` with service role key doesn't work for admin operations
- **Expected:** User deletion from Supabase dashboard now works

### ✅ Fix #3: Callback Logging
**File:** `app/auth/callback/route.ts`
- Added detailed logging for code and token_hash presence
- Improved error messages in redirect URL

---

## 📋 VERIFICATION STEPS (Do in order)

### Step 1: Wait for Deployment ⏱️
- [ ] Wait 3-5 minutes for GitHub Actions to complete
- [ ] Check Vercel deployment status: https://vercel.com/dashboard
- [ ] Confirm: "Ready" status appears

### Step 2: Clear Browser Cache 🗑️
- [ ] Open DevTools (F12)
- [ ] Right-click refresh button → "Empty cache and hard refresh"
- [ ] OR: Ctrl+Shift+Delete → Clear All → Hard Refresh

### Step 3: Test Magic Link Flow 🔗
1. **Go to login:** `https://hyperlocal-delivery-app.vercel.app/auth/login`
2. **Enter email:** Use a test email
3. **Click "Send Magic Link"**
4. **Check email** inbox for magic link
5. **Click the magic link** in email
6. **Expected result:** Redirected to `/shops` with profile menu showing your email ✅
7. **If redirected to login:** Check browser console (F12) for error messages

### Step 4: Verify Session Persistence 🔒
- [ ] After successful login, press F5 to refresh the page
- [ ] Expected: Still logged in, profile menu still shows email
- [ ] Not expected: Redirected back to login page

### Step 5: Check Browser Console 📺
Open DevTools → Console tab, you should see:
```
✅ Session found for: your-email@example.com
Auth state changed: SIGNED_IN has session: true
```

Do NOT see:
```
❌ No session found
Auth state changed: INITIAL_SESSION has session: false
```

### Step 6: Test User Deletion 🗑️
**Via Admin Panel:**
1. Go to Supabase Dashboard
2. Navigate to Authentication → Users
3. Click the three dots on any user
4. Click "Delete user"
5. Expected: User deleted successfully (no error)

**Via API (Advanced):**
```bash
curl -X DELETE \
  "https://hyperlocal-delivery-app.vercel.app/api/admin/users/[USER_ID]" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "message": "User [USER_ID] deleted successfully",
  "userId": "[USER_ID]"
}
```

---

## 🐛 DEBUGGING IF STILL BROKEN

### Symptom: Magic link redirects back to login

**Check 1: Code and Token in URL**
When you click the magic link, the URL should look like:
```
https://hyperlocal-delivery-app.vercel.app/auth/callback?code=ABC123...&token_hash=XYZ456...
```

If the URL is just `/auth/login` without code/token → Email link is wrong

**Check 2: Server Logs**
In Vercel dashboard:
1. Go to Deployments
2. Click latest deployment
3. Click "Functions" tab
4. Look for `/auth/callback` logs
5. Search for "🔐 Callback triggered"

Expected logs:
```
🔐 Callback triggered
📍 Code: present
📍 Token hash: present
🔄 Exchanging OTP code for session...
✅ Session created for user: your-email@example.com
```

**Check 3: Supabase Auth Logs**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Logs → Auth
4. Search for your email
5. Check if OTP was sent and exchanged

### Symptom: User deletion still fails

**Check 1: Service Role Key Exists**
In Vercel environment variables:
```
SUPABASE_SERVICE_ROLE_KEY → Should be set
```

If not set → Add it from Supabase Dashboard

**Check 2: Test API Directly**
Get a user ID from Supabase → Users table
```bash
curl -X DELETE \
  "https://hyperlocal-delivery-app.vercel.app/api/admin/users/[test-user-id]"
```

Check response and error message

**Check 3: Check Supabase for Foreign Key Constraints**
If user has orders → They can't be deleted due to FK constraint
1. Delete the user's orders first
2. Then delete the user

---

## 🎯 SUCCESS CRITERIA

You'll know it's fixed when:

✅ **Magic Link Works**
- Click email link → Redirected to /shops (not login)
- Profile menu shows your email
- Session persists on page refresh

✅ **User Deletion Works**
- Can delete users from Supabase dashboard without errors
- API returns `"success": true`

✅ **Console is Clean**
- No "No session found" errors
- Logs show "Session found for: email@example.com"

✅ **Deployment Succeeds**
- GitHub Actions: All jobs pass (green checkmarks)
- Vercel: "Ready" status shows

---

## 📞 If Still Issues

1. **Share the server logs** from Vercel (Functions tab, /auth/callback)
2. **Share browser console error** (F12 → Console)
3. **Share Supabase Auth logs** for the test email
4. **Confirm:** SUPABASE_SERVICE_ROLE_KEY is set in Vercel secrets

These will help pinpoint the exact issue.

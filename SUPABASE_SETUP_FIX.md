# 🔧 Supabase Configuration Fix - Magic Link Not Working

## Problem
When you click the magic link in the email, it takes you back to the login screen instead of logging you in.

## Root Cause
**Supabase doesn't have your production URL registered as an allowed redirect URL.**

When Supabase sends the magic link, it includes a callback to `https://hyperlocal-delivery-app.vercel.app/auth/callback`. If this URL is not registered in your Supabase project settings, the callback fails.

---

## ✅ SOLUTION: Add Redirect URLs to Supabase

### Step 1: Open Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select your "hyperlocal-delivery" project
3. Click **"Authentication"** in the left sidebar

### Step 2: Configure Redirect URLs
1. Click **"URL Configuration"** (under Settings section)
2. Look for **"Redirect URLs"** section

### Step 3: Add Your URLs
Add these URLs to the redirect list (one per line):

**For Production (Required):**
```
https://hyperlocal-delivery-app.vercel.app/auth/callback
```

**For Local Development (Optional but useful):**
```
http://localhost:3000/auth/callback
http://localhost:3002/auth/callback
```

**For any other domains you use:**
```
https://yourdomain.com/auth/callback
```

### Step 4: Save Changes
- Click the **"Save"** button at the bottom
- Wait for confirmation message

### Step 5: Test Again
1. Go to: https://hyperlocal-delivery-app.vercel.app
2. Click **Login**
3. Enter your email
4. Click **Send Magic Link**
5. Check your email for the link
6. **Click the link** - should now log you in! ✅

---

## Visual Guide

### Where to find URL Configuration in Supabase:

```
Dashboard
├── Your Project
├── Authentication (left sidebar)
│   ├── Providers
│   ├── Users
│   ├── Settings
│   │   └── URL Configuration ← CLICK HERE
│   │       └── Redirect URLs ← ADD YOUR URLS HERE
│   └── ...
```

---

## Important Notes

⚠️ **Do NOT include query parameters in redirect URLs**
- ❌ Wrong: `https://hyperlocal-delivery-app.vercel.app/auth/callback?code=123`
- ✅ Correct: `https://hyperlocal-delivery-app.vercel.app/auth/callback`

⚠️ **Protocol matters (http vs https)**
- For localhost: Use `http://localhost:3000`
- For production: Use `https://` (never `http://`)

⚠️ **Exact match required**
- If your domain is `hyperlocal-delivery-app.vercel.app`, don't add `www.hyperlocal-delivery-app.vercel.app`

---

## What Happens After Setup

1. **User clicks "Send Magic Link"**
   ```
   Your App → Supabase
   "Please send magic link to user@email.com"
   "Redirect to: https://hyperlocal-delivery-app.vercel.app/auth/callback"
   ```

2. **Supabase validates the redirect URL**
   ```
   Supabase checks: "Is this URL in my allowed list?"
   ✅ Yes → Send email with magic link
   ❌ No → Reject (this is what was happening)
   ```

3. **User clicks email link**
   ```
   Email link: https://hyperlocal-delivery-app.vercel.app/auth/callback?code=xyz&type=magiclink
                                      ↓
   /app/auth/callback/route.ts (your API route)
   - Receives the code
   - Exchanges code for session (exchangeCodeForSession)
   - Creates auth cookies
   - Redirects to /shops or /profile
   ```

4. **User is logged in!**
   ```
   Auth provider detects SIGNED_IN event
   Profile menu shows user's name ✅
   Session persists on page refresh ✅
   ```

---

## Troubleshooting

### Still Not Working After Adding URLs?

1. **Clear browser cache & cookies**
   - Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
   - Select "All time"
   - Check "Cookies and other site data"
   - Click "Clear data"

2. **Check Supabase Console Logs**
   - Go to Supabase Dashboard
   - Click **Auth** → **Logs**
   - Try logging in again
   - Look for error messages in the logs

3. **Check Network Requests**
   - Open DevTools (`F12`)
   - Go to **Network** tab
   - Click magic link
   - Look for requests to `https://hyperlocal-delivery-app.vercel.app/auth/callback`
   - Check if response is 200 or if there's an error

### Common Error Messages

**"Invalid redirect URL"**
- Solution: The URL in your redirect list doesn't match exactly
- Check for typos, extra slashes, wrong protocol

**"Too many redirect requests"**
- Solution: There might be an infinite redirect loop
- This shouldn't happen with our setup, but clear cache if it does

**"Invalid OTP"**
- Solution: Magic link might have expired (24 hours)
- Ask for a new magic link to be sent

---

## Code Reference

### Where the magic link is sent (app/auth/login/page.tsx):
```typescript
const { error } = await supabase.auth.signInWithOtp({
  email: email.trim(),
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`, // ← This URL must be in Supabase
  }
})
```

### Where the magic link is processed (app/auth/callback/route.ts):
```typescript
export async function GET(request: NextRequest) {
  const code = new URL(request.url).searchParams.get("code")
  
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      // Error! Probably redirect URL not in Supabase
      return NextResponse.redirect(
        new URL(`/auth/login?error=${error.message}`, requestUrl.origin)
      )
    }
    // Success! Redirect to shops
    return NextResponse.redirect(new URL("/shops", requestUrl.origin))
  }
}
```

---

## Testing Checklist

After adding the redirect URLs to Supabase:

- [ ] 1. Go to https://hyperlocal-delivery-app.vercel.app
- [ ] 2. Click "Login"
- [ ] 3. Enter your email
- [ ] 4. Click "Send Magic Link"
- [ ] 5. Check your email inbox (and spam folder)
- [ ] 6. Click the magic link in the email
- [ ] 7. **✅ Should be redirected to /shops and logged in**
- [ ] 8. Refresh the page - **✅ Should STAY logged in**
- [ ] 9. Click profile menu - **✅ Should show your name**

---

## Questions?

If you need help:
1. Share a screenshot of your Supabase "URL Configuration" page
2. Share the error message from DevTools Console
3. Check Supabase Auth Logs for specific error details

**Status:** Once you add the redirect URLs, magic link auth should work perfectly! 🚀

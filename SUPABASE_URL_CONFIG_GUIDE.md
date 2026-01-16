# Supabase URL Configuration - Visual Guide

## 📍 Finding the Right Settings

### Option A: Direct Link (Fastest)
Go directly to your project settings URL:
```
https://app.supabase.com/project/[YOUR-PROJECT-ID]/settings/auth
```

### Option B: Through Dashboard (Visual Guide)

**Step 1:** Open Supabase Dashboard
```
https://app.supabase.com
```

**Step 2:** Click Your Project
Look for: **hyperlocal-delivery** (or your project name)

**Step 3:** Navigate to Auth Settings
```
Left Sidebar:
├── 🏠 Dashboard
├── 🔑 Authentication ← CLICK HERE
│   ├── Users
│   ├── Providers
│   ├── Templates
│   └── ...
├── Settings
│   ├── General
│   ├── Auth
│   │   └── URL Configuration ← OR CLICK HERE
│   └── ...
└── ...
```

**Step 4:** Find Redirect URLs Section
```
Settings → Authentication → URL Configuration

Or

Authentication → [scroll down] → URL Configuration
```

---

## 🎯 What You'll See

Once you're in URL Configuration, you'll see:

```
┌─────────────────────────────────────────────┐
│  URL Configuration                          │
├─────────────────────────────────────────────┤
│                                             │
│  Site URL                                   │
│  [https://hyperlocal-delivery-...    ]     │
│                                             │
│  Redirect URLs                              │
│  ┌─────────────────────────────────────┐   │
│  │ https://hyperlocal-delivery...      │   │
│  │ /auth/callback                      │   │
│  │                                     │   │
│  │ http://localhost:3000/auth/callback │   │
│  │ http://localhost:3002/auth/callback │   │
│  │                                     │   │
│  │ [+ Add new URL]  [SAVE]             │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ✏️ How to Add Your URL

### Current URLs (might be empty or incomplete)
Check what's already there.

### URLs to Add

**Production (Required):**
```
https://hyperlocal-delivery-app.vercel.app/auth/callback
```

**Local Development (Optional):**
```
http://localhost:3000/auth/callback
http://localhost:3002/auth/callback
```

### Steps to Add:
1. Click in the text area
2. Add one URL per line
3. Click **SAVE** button
4. Wait for success message

---

## ✅ Verification Checklist

After adding the URL:

- [ ] You see the URL in the list
- [ ] You clicked the SAVE/UPDATE button
- [ ] Confirmation message appeared
- [ ] Page didn't show any errors
- [ ] You waited 5-10 seconds for changes to propagate

---

## 🧪 Test the Fix

Once saved, immediately test:

1. Open: https://hyperlocal-delivery-app.vercel.app
2. Click Login
3. Enter test email
4. Send magic link
5. Check email
6. Click link from email
7. **Should redirect to app and log you in** ✅

---

## ⚠️ Common Mistakes

### ❌ Adding with Query Parameters
```
WRONG: https://hyperlocal-delivery-app.vercel.app/auth/callback?code=123
RIGHT: https://hyperlocal-delivery-app.vercel.app/auth/callback
```

### ❌ Including Path Slashes Multiple Times
```
WRONG: https://hyperlocal-delivery-app.vercel.app//auth/callback//
RIGHT: https://hyperlocal-delivery-app.vercel.app/auth/callback
```

### ❌ Using HTTP for Production
```
WRONG: http://hyperlocal-delivery-app.vercel.app/auth/callback
RIGHT: https://hyperlocal-delivery-app.vercel.app/auth/callback
```

### ❌ Including 'www' When Not Needed
```
WRONG: https://www.hyperlocal-delivery-app.vercel.app/auth/callback
RIGHT: https://hyperlocal-delivery-app.vercel.app/auth/callback
```

---

## 🔍 How to Find Your Project ID

If you need the direct link to your project settings:

1. Open: https://app.supabase.com
2. Click your project
3. Look at the URL:
   ```
   https://app.supabase.com/project/[PROJECT-ID-HERE]/settings/auth
                               ↑
                          Copy this part
   ```
4. Your project ID is the long alphanumeric string

---

## 📱 What Happens Behind the Scenes

```
Magic Link Flow:
────────────────

User Email Login:
  You → App: "Send magic link for user@example.com"
  You → Supabase: "Send OTP"
  Supabase: "Email sent to user@example.com"
  
Email Link:
  Email: "Click here: https://.../?code=ABC123"
  
Click Email Link:
  Browser: GET /auth/callback?code=ABC123
  Supabase checks: "Is /auth/callback in redirect list?"
  ✅ YES → Send session to app
  ❌ NO → Reject, send back to login ← THIS WAS YOUR ISSUE
  
Session Created:
  App: "User authenticated! Show profile..."
  Browser: "Store auth cookie"
  Profile: "Display user info"
```

---

## 🆘 Still Not Working?

### Check 1: Is the URL Exactly Right?
```bash
Production URL: https://hyperlocal-delivery-app.vercel.app/auth/callback
Your URL:       [COPY FROM SUPABASE SETTINGS]
Match?          ✅ YES or ❌ NO
```

### Check 2: Did You Click SAVE?
- [ ] After adding URL, did you click the SAVE/UPDATE button?
- [ ] Did you see a success message?
- [ ] Did you wait 5 seconds?

### Check 3: Check Supabase Logs
1. Go to: Authentication → Logs
2. Try to log in again
3. Look for error messages
4. Share the error details

### Check 4: Browser Cache
1. Open DevTools (F12)
2. Right-click Refresh button
3. Click "Empty cache and hard refresh"
4. Try again

---

## 📞 Need Help?

1. **Screenshot:** Take a screenshot of your URL Configuration page
2. **Error Message:** If you see an error, copy the exact message
3. **Check Logs:** Go to Auth → Logs and share any error messages
4. **Share with Developer:** Provide the info above

---

## ✨ Success Indicators

You'll know it's working when:

✅ Click magic link in email  
✅ Redirected to app (not back to login)  
✅ Profile menu shows your name  
✅ Refresh page → still logged in  
✅ Can access protected pages  

**Congratulations!** 🎉 Authentication is working!

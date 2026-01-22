# Admin Route Protection - Setup Guide

## ✅ Implementation Complete

Your `/admin` routes are now protected with **email-based access control** using Next.js middleware.

## Configuration

### Step 1: Set Your Admin Email

Add your admin email to `.env.local`:

```bash
NEXT_PUBLIC_ADMIN_EMAIL=your-email@example.com
```

**Important:** Replace `your-email@example.com` with your actual admin email address that you use to log in to Supabase.

### Step 2: Deploy to Vercel

The middleware automatically works on Vercel Edge Runtime. No additional configuration needed.

Just push your code and deploy:

```bash
git add .
git commit -m "Add admin route protection"
git push origin main
```

## How It Works

### Protection Flow

```
User visits /admin
    ↓
Middleware intercepts request
    ↓
Check session from cookies
    ↓
NO SESSION? → Redirect to /
    ↓
SESSION EXISTS? → Check email
    ↓
EMAIL !== ADMIN_EMAIL? → Redirect to /
    ↓
EMAIL === ADMIN_EMAIL? → Allow access ✅
```

### Key Features

✅ **Email-based only** - No role checks, no database queries
✅ **Session from cookies** - Uses Supabase auth session
✅ **Edge runtime** - Works on Vercel without cold starts
✅ **No modifications** - AuthProvider untouched
✅ **Simple fallback** - Non-admin users redirect to `/`

## Testing Locally

1. Start dev server:
```bash
npm run dev
```

2. Login with your admin email → Can access `/admin` ✅

3. Logout, login with different email → Blocked from `/admin` ✅

4. Access `/admin` without logging in → Redirected to `/` ✅

## Production Behavior

### On Vercel

- Middleware runs on Edge Runtime (fast, global)
- Session read from cookies (no extra database calls)
- Protected instantly on every request
- Works in all regions

### Logs

When testing, you'll see:
- ✅ `Admin access granted: your-email@example.com`
- 🚫 `Admin access blocked: other@email.com`
- 🚫 `Admin access blocked: no session`

## Files Modified

Only **one file changed**:
- `middleware.ts` - Added email-based admin check using `createMiddlewareClient`

## No Other Changes

Everything else remains unchanged:
- ✅ AuthProvider - untouched
- ✅ Login/signup logic - untouched
- ✅ Database - untouched
- ✅ Other routes - untouched

## Troubleshooting

### "Admin access blocked: no session"
- You're not logged in
- Login first with your admin email

### "Admin access blocked: <email> is not admin"
- You logged in with a different email
- Logout and login with admin email from `.env.local`

### Environment variable not showing
- Did you add `NEXT_PUBLIC_ADMIN_EMAIL` to `.env.local`?
- Does it match your Supabase login email **exactly**?
- Restart dev server after changing `.env.local`

### Works locally but not on Vercel
- Add `NEXT_PUBLIC_ADMIN_EMAIL` to Vercel Environment Variables
- Go to: Project Settings → Environment Variables
- Add key: `NEXT_PUBLIC_ADMIN_EMAIL`, value: `your-email@example.com`
- Redeploy

## Security Notes

- ⚠️ Don't hardcode your email in the code (use env var)
- ⚠️ Make sure `.env.local` is in `.gitignore` (it is)
- ⚠️ Only one admin email supported - if you need more, ask for a role-based system

## Next Steps

The admin routes are now protected. You can:
1. Add more protected routes to the middleware matcher
2. Add different email checks for other admin paths
3. Implement role-based auth if needed later

All without touching AuthProvider or login/signup logic. ✅

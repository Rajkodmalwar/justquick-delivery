# 🚀 Production Environment Setup Guide

This guide explains all environment variables and configurations that **MUST be updated** when deploying to production.

## Quick Reference: URLs to Update

### Local Development (Current)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (Vercel Deployment)
```
NEXT_PUBLIC_API_URL=https://justquick-delivery.vercel.app
NEXTAUTH_URL=https://justquick-delivery.vercel.app
NEXT_PUBLIC_APP_URL=https://justquick-delivery.vercel.app
```

### Production (Custom Domain)
```
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 📋 Complete Production Checklist

### 1. **Vercel Environment Variables** (In Vercel Dashboard)

Set these in your Vercel project settings → Environment Variables:

#### Public Variables (Safe for Browser)
```
✅ NEXT_PUBLIC_SUPABASE_URL=https://rlpgpdamdvqrtcdgtfmh.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ NEXT_PUBLIC_API_URL=https://justquick-delivery.vercel.app
✅ NEXT_PUBLIC_APP_URL=https://justquick-delivery.vercel.app
```

#### Secret Variables (Server-Only)
```
✅ SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ NEXTAUTH_URL=https://justquick-delivery.vercel.app
✅ NEXTAUTH_SECRET=<generate-new-secure-secret>
```

### 2. **Generate New NEXTAUTH_SECRET**

⚠️ **CRITICAL**: Never reuse local development secret in production!

```bash
# Generate a new secure secret
openssl rand -base64 32

# Example output:
# abc123xyz789+/==

# Or use this one-liner (Node.js):
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. **Update Supabase Redirect URLs**

Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**:

#### Allowed Redirect URLs
```
https://justquick-delivery.vercel.app/auth/callback
https://yourdomain.com/auth/callback (if using custom domain)
```

#### Site URL
```
https://justquick-delivery.vercel.app
```

### 4. **Verify Files Without Hardcoded URLs**

These files use `window.location.origin` (✅ automatically adapts):
- `components/buyer/buyer-login.tsx` - ✅ Dynamic
- `app/auth/login/page.tsx` - ✅ Dynamic
- `app/auth/register/page.tsx` - ✅ Dynamic
- `app/auth/forgot-password/page.tsx` - ✅ Dynamic
- `app/admin/dashboard/AdminOrders.tsx` - ✅ Dynamic

All authentication redirects automatically use the current domain! ✅

---

## 🔒 Security Checklist

- [ ] Changed `NEXTAUTH_URL` from localhost to production URL
- [ ] Changed `NEXT_PUBLIC_API_URL` from localhost to production URL
- [ ] Generated new `NEXTAUTH_SECRET` (never reuse dev secret)
- [ ] Updated Supabase redirect URLs in Supabase dashboard
- [ ] Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- [ ] Verified all variables are set in Vercel before deploying
- [ ] Set environment variables for ALL environments (Production, Preview, Development)

---

## 📝 Environment Variables Explained

### Core Supabase (Must Stay the Same)
```
NEXT_PUBLIC_SUPABASE_URL        = Your Supabase project URL (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY   = Your Supabase anon key (public)
SUPABASE_SERVICE_ROLE_KEY       = Server-only admin key (SECRET)
DATABASE_URL                     = PostgreSQL connection string (optional)
```

### Authentication
```
NEXTAUTH_URL                    = Your production domain
NEXTAUTH_SECRET                 = Random 32+ char string for signing sessions
```

### Application URLs
```
NEXT_PUBLIC_API_URL             = API endpoint (same as app domain for same-origin requests)
NEXT_PUBLIC_APP_URL             = Application domain (for redirects)
```

### Optional Services
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  = Stripe test/live key
STRIPE_SECRET_KEY                   = Stripe secret (server-only)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID     = Vercel Analytics ID
NEXT_PUBLIC_SENTRY_DSN              = Sentry error tracking
```

---

## 🚨 Common Mistakes to Avoid

❌ **DON'T:**
- Use `http://` in production (always use `https://`)
- Reuse development `NEXTAUTH_SECRET` in production
- Expose `SUPABASE_SERVICE_ROLE_KEY` in environment variables visible to browser
- Forget to update Supabase redirect URLs
- Set wrong environment variables for Preview environments

✅ **DO:**
- Use `https://` with your actual domain
- Generate a NEW secure `NEXTAUTH_SECRET`
- Keep service role key in Vercel's "Sensitive" variables
- Test auth flow after deploying
- Set variables for each Vercel environment separately

---

## 🧪 Testing Production Configuration

After deploying to Vercel with updated environment variables:

### 1. Test Login Flow
```
1. Go to https://your-deployment.vercel.app/auth/login
2. Enter email and click "Send Magic Link"
3. Check email for auth link
4. Click link and verify redirect back to app
```

### 2. Test API Routes
```bash
curl https://your-deployment.vercel.app/api/orders
```

### 3. Verify Environment Variables
```
In browser DevTools:
- Check Network tab for API calls
- Verify requests go to correct domain
- Confirm auth callbacks use correct origin
```

### 4. Check Vercel Logs
```
Vercel Dashboard → Deployments → [Your Deployment] → Logs
Look for any environment variable errors
```

---

## 📋 File Changes Summary

### Files That Auto-Adapt (No Changes Needed)
- `components/buyer/buyer-login.tsx` - Uses `window.location.origin`
- `app/auth/login/page.tsx` - Uses `window.location.origin`
- `app/auth/register/page.tsx` - Uses `window.location.origin`
- `app/auth/forgot-password/page.tsx` - Uses `window.location.origin`
- `app/admin/dashboard/AdminOrders.tsx` - Uses `window.location.origin`

### Configuration Files to Update (Vercel Dashboard)
- Vercel Environment Variables → Add all secret/public variables
- Supabase Dashboard → Auth → Redirect URLs configuration

### Files with Comments (Documentation Only)
- `.env.local` - Development only (local machine)
- `.env.example` - Template for new developers
- `PRODUCTION_ENV_SETUP.md` - This file

---

## 🔗 Custom Domain Setup

If using a custom domain instead of vercel.app:

### 1. Add Domain to Vercel
```
Vercel Dashboard → Project Settings → Domains → Add Domain
```

### 2. Update DNS Records
```
Your registrar → DNS settings → Add CNAME record
CNAME: yourdomain.com → cname.vercel-dns.com
```

### 3. Update Environment Variables
```
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. Update Supabase Redirect URLs
```
Supabase Dashboard → Auth → Redirect URLs:
https://yourdomain.com/auth/callback
```

---

## 🆘 Troubleshooting

### "Invalid token" or authentication fails
- Check `NEXTAUTH_URL` matches your actual domain
- Verify `NEXTAUTH_SECRET` is set in Vercel
- Confirm Supabase redirect URLs include your domain

### API requests fail with CORS errors
- Ensure `NEXT_PUBLIC_API_URL` matches your domain
- Check that Supabase is configured for your domain
- Verify production build succeeded

### Magic link doesn't redirect properly
- Verify `NEXT_PUBLIC_APP_URL` matches your domain
- Check Supabase redirect URL configuration
- Test that auth callbacks are being sent to correct origin

---

## 📞 Support

For issues with environment setup:
1. Check this file first
2. Review Vercel logs: `Vercel Dashboard → [Project] → Deployments → Logs`
3. Check Supabase logs: `Supabase Dashboard → Auth → Logs`
4. Verify DNS propagation if using custom domain

# Deployment Guide - JustQuick MVP

## 📋 Prerequisites

Before deploying, ensure you have:

- [ ] GitHub Account
- [ ] Vercel Account (free)
- [ ] Supabase Account (free)
- [ ] Git installed locally
- [ ] Node.js 18.17+

---

## 🔧 Step 1: Prepare for GitHub

### 1.1 Initialize Git Repository

```bash
cd justquick-delivery
git init
git config user.name "Your Name"
git config user.email "your@email.com"
```

### 1.2 Add All Files

```bash
git add .
git commit -m "Initial commit: JustQuick MVP - Production ready"
```

### 1.3 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `justquick-delivery`
3. Description: `Hyperlocal delivery platform - 9 minute delivery`
4. Visibility: **Public** (for free Vercel deployment)
5. Click "Create repository"

### 1.4 Push to GitHub

```bash
git remote add origin https://github.com/yourusername/justquick-delivery.git
git branch -M main
git push -u origin main
```

### 1.5 Verify on GitHub

Visit: `https://github.com/yourusername/justquick-delivery`
- Should show all your code ✓
- README.md visible ✓
- .gitignore working ✓

---

## 🌐 Step 2: Setup Supabase (Database)

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project name**: `justquick-mvp`
   - **Database Password**: Create strong password
   - **Region**: Choose closest to you (India: ap-south-1)
4. Click "Create new project"
5. Wait 2-3 minutes for setup

### 2.2 Get API Credentials

1. Go to Settings → API
2. Copy and save:
   ```
   Project URL: https://xxxxxxxxxxxx.supabase.co
   Anon Public Key: eyJhbGc...
   ```

### 2.3 Setup Database Tables

Option A: Auto-setup (Recommended)
- Supabase automatically creates tables from auth

Option B: Manual setup
1. Go to SQL Editor
2. Run migrations from `scripts/sql/` folder
3. Execute one by one

### 2.4 Enable Features in Supabase

1. **Authentication**
   - Email provider → Enabled ✓
   - Magic Link → Enabled ✓
   - Auto Confirm: OFF
   - Redirect URLs: Add both:
     - `http://localhost:3000/auth/callback`
     - `https://your-domain.vercel.app/auth/callback`

2. **Realtime**
   - Enable Realtime → ON ✓

3. **Storage**
   - Create bucket: `products` (public)
   - Create bucket: `shop-images` (public)

---

## 🚀 Step 3: Deploy to Vercel (FREE)

### 3.1 Sign Up on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign up"
3. Choose "Sign up with GitHub"
4. Authorize GitHub access

### 3.2 Import Project

1. Click "New Project"
2. Click "Import Git Repository"
3. Paste: `https://github.com/yourusername/justquick-delivery`
4. Click "Import"

### 3.3 Configure Environment Variables

In Vercel Dashboard:

1. Go to Settings → Environment Variables
2. Add variables (get from Supabase):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Make sure both show "Preview, Production" ✓
4. Click "Save"

### 3.4 Deploy

1. Click "Deploy"
2. Wait 2-5 minutes
3. See "Congratulations! Deployment successful"
4. Click "Visit" to see live site

### 3.5 Verify Deployment

Your app is now live at: `https://justquick-delivery.vercel.app`

Test:
- [ ] Home page loads
- [ ] Dark/Light toggle works
- [ ] Login works
- [ ] Registration works
- [ ] Magic link sends

---

## 🔐 Step 4: Security Configuration

### 4.1 Update Magic Link Redirects

In Supabase Dashboard:

1. Settings → Authentication → Email
2. Find "Site URL"
3. Update to: `https://yourdomain.vercel.app`
4. Update "Redirect URLs" to match your domain

### 4.2 Update CORS Settings

In Supabase:
1. Settings → API → CORS
2. Add your Vercel domain:
   - `https://justquick-delivery.vercel.app`
   - `*.vercel.app`

### 4.3 Enable HTTPS

Vercel auto-enables HTTPS ✓

Check browser:
- Address bar shows 🔒
- Site loads securely

### 4.4 Setup Environment in Vercel

1. Settings → Environment Variables
2. For Production environment:
   - NEXT_PUBLIC_SUPABASE_URL → Production ✓
   - NEXT_PUBLIC_SUPABASE_ANON_KEY → Production ✓

### 4.5 Database Backup (Optional)

In Supabase:
1. Settings → Backups
2. Enable daily backups
3. Set retention: 30 days

---

## 📊 Step 5: Post-Deployment

### 5.1 Monitor Performance

**Vercel Dashboard:**
- Analytics → Observe page load times
- Deployments → Check status
- Logs → Watch for errors

**Supabase Dashboard:**
- Database → Check usage
- Logs → Watch for errors

### 5.2 Setup Error Tracking (Optional)

Install Sentry:
```bash
npm install @sentry/nextjs
```

### 5.3 Enable Analytics

In Vercel:
1. Click "Enable Web Analytics"
2. See real visitor data

### 5.4 Custom Domain (Optional)

To use custom domain:
1. Vercel Settings → Domains
2. Add your domain
3. Update DNS records
4. Wait 24 hours for verification

---

## 🔄 Step 6: Continuous Deployment

### 6.1 Auto-Deploy on GitHub Push

Already configured! When you:
```bash
git push origin main
```

Vercel automatically:
1. Detects push
2. Builds project
3. Deploys to production (if successful)

### 6.2 Preview Deployments

Pull requests automatically get:
- Preview URL
- Automatic updates
- Testing environment

### 6.3 Rollback Deployment

If deployment breaks:
1. Vercel Dashboard → Deployments
2. Click past stable deployment
3. Click "Promote to Production"
4. Site restored instantly

---

## 🚨 Troubleshooting

### Issue: "Build Failed"

**Solution:**
1. Check Vercel build logs
2. Look for errors (usually missing env vars)
3. Fix locally: `npm run build`
4. Push again

### Issue: "Magic Link Not Working"

**Solution:**
1. Check Supabase email in SQL Editor
2. Verify redirect URL matches
3. Check spam folder
4. Verify environment variables

### Issue: "Page Shows 404"

**Solution:**
1. Verify route exists in `app/` folder
2. Check build output for errors
3. Clear browser cache (Ctrl+Shift+Del)
4. Try incognito mode

### Issue: "Database Connection Error"

**Solution:**
1. Verify Supabase is running
2. Check `.env.local` has correct URLs
3. Test locally first: `npm run dev`
4. Verify Vercel env vars match

### Issue: "Can't Login with Magic Link"

**Solution:**
1. Check Supabase authentication enabled
2. Verify email provider configured
3. Check redirect URLs in Supabase
4. Check browser console for errors

---

## 📈 Performance Checklist

- [ ] Build time < 10 seconds
- [ ] First Load JS < 200 kB
- [ ] Page loads < 3 seconds
- [ ] Core Web Vitals green
- [ ] No broken links
- [ ] Images optimized
- [ ] Fonts loaded
- [ ] No console errors

Check Vercel Analytics dashboard

---

## 🔒 Security Checklist

- [ ] No hardcoded secrets
- [ ] .env.local in .gitignore ✓
- [ ] HTTPS enabled ✓
- [ ] Supabase RLS policies enabled
- [ ] CORS configured correctly
- [ ] Database backups enabled
- [ ] Admin accounts secured
- [ ] Rate limiting configured (Vercel)

---

## 📱 Testing Checklist

Before production:

- [ ] Test on mobile (iPhone, Android)
- [ ] Test on tablet
- [ ] Test on desktop (Chrome, Firefox, Safari)
- [ ] Test dark mode toggle
- [ ] Test login/signup flow
- [ ] Test magic link email
- [ ] Test shopping cart
- [ ] Test order creation
- [ ] Test notifications
- [ ] Test responsiveness

---

## 🎯 Next Steps After Deployment

### Week 1
- Monitor for errors
- Test user flows
- Check analytics
- Gather feedback

### Week 2
- Fix any bugs
- Optimize performance
- Scale if needed
- Plan updates

### Month 1
- Full feature testing
- Security audit
- Performance audit
- Team feedback

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

---

## 🎉 Success!

Your JustQuick MVP is now:
- ✅ Pushed to GitHub
- ✅ Deployed to Vercel
- ✅ Connected to Supabase
- ✅ Live on the internet
- ✅ Production ready

**Share your app:**
- Live URL: `https://justquick-delivery.vercel.app`
- GitHub URL: `https://github.com/yourusername/justquick-delivery`

---

**Last Updated**: January 16, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅

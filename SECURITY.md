# Security Policy - JustQuick MVP

## 🔒 Security Standards

JustQuick MVP follows industry-standard security practices:
- OWASP Top 10 compliance
- HTTPS/TLS encryption
- Secure authentication
- Data protection
- Regular audits

---

## 🛡️ Authentication Security

### Magic Link Implementation

**Safety Features:**
- 24-hour token expiration
- One-time use only
- Email verification required
- No passwords stored
- Automatic logout on token use

**Best Practices:**
```typescript
// ✅ Correct: Verify token before allowing access
const { user, error } = await supabase.auth.verifyOtp({
  email,
  token,
  type: 'email'
})

// ❌ Avoid: Never trust unverified tokens
// if (url.searchParams.get('code')) { ... }
```

### Session Security

- Sessions stored in httpOnly cookies
- CSRF protection enabled
- Session timeout: 7 days
- Automatic logout on suspicious activity

**Verifying Session (Server):**
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  // Redirect to login
}
```

---

## 🚪 User Access Control

### Role-Based Access (RLS)

All database tables have Row Level Security (RLS):

**Buyers:**
- Read own profile
- Create own orders
- Access own addresses
- Modify own cart

**Vendors:**
- Read own shop
- Create products
- View own orders
- Manage inventory

**Delivery Partners:**
- View assigned deliveries
- Update delivery status
- Access customer location (for delivery)

**Policy Example:**
```sql
-- Buyers can only see their own orders
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Vendors can only manage own products
CREATE POLICY "Vendors manage own products"
ON products FOR UPDATE
USING (auth.uid() = vendor_id);
```

### Password Reset Security

**Protected Endpoints:**
- `/api/auth/reset-password` - Rate limited
- `/api/auth/forgot-password` - Verification required
- Magic link sent to verified email only

---

## 🔐 Data Protection

### Sensitive Data Handling

**Never log or expose:**
- User passwords (none stored - magic links only)
- Payment info (Stripe handles)
- Personal addresses (encrypted)
- Phone numbers (hashed)

**Encryption:**
- In transit: HTTPS/TLS
- At rest: Supabase encryption
- Database: Encrypted backups

### Data Storage

**Public Data (with RLS):**
- Shop info
- Product listings
- User profiles
- Order summaries

**Private Data (protected):**
- User addresses
- Payment methods
- Delivery routes
- Personal info

---

## 🔑 API Key Security

### Public Keys (Safe to expose)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # Anonymous key only
```

### Secret Keys (Never expose)
```env
SUPABASE_SERVICE_ROLE_KEY=xxxxx  # DO NOT use in frontend
STRIPE_SECRET_KEY=sk_live_xxxxx   # Backend only
DATABASE_URL=postgresql://...      # Backend only
```

### Key Rotation

When rotating keys:
1. Create new key in provider
2. Update environment variables
3. Verify connection works
4. Delete old key (grace period)
5. Monitor for errors

---

## 🌐 Network Security

### HTTPS Enforcement

- Vercel auto-enables HTTPS ✓
- All traffic encrypted
- HSTS headers enabled ✓
- No mixed content allowed

**Check:**
```bash
# Should show A+ rating
curl -I https://yourapp.vercel.app
```

### CORS Configuration

**Configured Origins:**
- Your Vercel domain
- Your custom domain (if applicable)
- localhost:3000 (development only)

**Not allowed:**
- Wildcard (*) - too permissive
- Unverified domains
- Localhost in production

---

## 🔍 API Security

### Rate Limiting

**Enabled on:**
- Login/signup: 5 attempts per 15 minutes
- Password reset: 3 attempts per hour
- API calls: 100 per minute (free tier)

**Implementation:**
```typescript
// Redis rate limiter (Vercel KV optional)
const { success } = await rateLimit(req.ip)
if (!success) {
  return new Response('Too many requests', { status: 429 })
}
```

### Input Validation

**Always validate:**
```typescript
// ✅ Correct: Validate before processing
const { email } = schema.parse(req.body)

// ❌ Avoid: Never trust user input
// const email = req.body.email
```

### SQL Injection Prevention

**Safe (Parameterized):**
```typescript
// ✅ Supabase client handles escaping
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('shop_id', shopId)

// ❌ Avoid: Never concatenate SQL
// const query = `SELECT * FROM products WHERE id = ${id}`
```

---

## 🚨 Logging & Monitoring

### What to Log

✅ **Log these:**
- Failed login attempts
- Permission denials
- Rate limit hits
- API errors
- Database errors

❌ **Never log:**
- Passwords
- Tokens
- API keys
- Personal data
- Credit card info

**Implementation:**
```typescript
// Good: Log safe info
logger.warn(`Failed login: ${email}`, { timestamp, ip })

// Bad: Never do this
logger.info(`Token: ${token}`) // Dangerous!
```

### Error Messages

**Frontend (User sees):**
```
"Login failed. Please try again."
"Invalid email or magic link expired."
```

**Backend (Logs show detail):**
```
"Email not found in database"
"OTP token invalid or expired"
"Rate limit exceeded for IP 192.168.1.1"
```

---

## 🔄 Dependency Security

### Vulnerable Packages

Check regularly:
```bash
npm audit
npm audit fix  # Auto-fix safe issues
npm update     # Update dependencies
```

### Trusted Packages Only

Used in project:
- `next` - Official Next.js
- `supabase-js` - Official Supabase
- `tailwindcss` - Official Tailwind
- `react` - Official React
- `zod` - Validation (trusted)

**Before adding:**
1. Check npm downloads/week
2. Check GitHub stars
3. Check last update date
4. Check security audit

---

## 📋 Environment Variables Security

### Development (.env.local)
```env
# Local development only - NEVER commit
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc_local
```

### Production (.env.production)
```env
# In Vercel dashboard - NOT in git
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc_prod
```

**Never commit secrets:**
```bash
# ✅ Correct
.env.local
.env.*.local
.env.production.local

# ❌ Wrong
.env.production  # Should not be in git
```

---

## 🏗️ Database Security

### Row Level Security (RLS)

All tables must have RLS enabled:
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable users to read own data" 
ON users FOR SELECT USING (auth.uid() = id);
```

### Database Backup

**Automatic:** Supabase daily backups
**Manual:**
```bash
# Export via Supabase CLI
supabase db dump --db-url $DATABASE_URL > backup.sql

# Store securely (encrypted cloud storage)
```

### Query Performance

Monitor slow queries:
```sql
-- In Supabase: Logs → Slow Queries
-- Anything > 1 second investigate
```

---

## 🛡️ Backend Security

### API Endpoints Protection

**Always verify:**
```typescript
// ✅ Correct: Verify auth before processing
export async function POST(req) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Process request
}
```

### Sensitive Operations

**Require email verification:**
- Changing email
- Password reset (N/A - passwordless)
- Deleting account
- Changing payment method

**Require 2FA (future):**
- Admin access
- Sensitive settings
- Large transactions

---

## 🚀 Deployment Security

### Pre-Deployment Checklist

- [ ] All secrets in .env.production (NOT in code)
- [ ] `.env.production` in .gitignore
- [ ] No console.logs with sensitive data
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error messages generic (no detail leaks)
- [ ] Supabase RLS enabled
- [ ] Database backups enabled
- [ ] Monitoring setup
- [ ] Build successful locally
- [ ] All tests pass

### Production Deployment

```bash
# ✅ Verify before push
npm run build        # No errors
npm run lint         # No warnings
npm audit            # Fix vulnerabilities
git push origin main # Deploy to Vercel
```

---

## 🔄 Incident Response

### If Compromised

1. **Immediate:**
   - Stop suspicious activity
   - Check logs for unauthorized access
   - Rotate all keys

2. **Short-term:**
   - Update passwords/secrets
   - Review database for unauthorized changes
   - Check logs for what was accessed

3. **Long-term:**
   - Implement 2FA
   - Enhanced monitoring
   - Security audit

### Reporting Security Issues

**DO NOT create public GitHub issue**

Instead:
1. Email: security@yourdomain.com
2. Include:
   - Vulnerability description
   - Steps to reproduce
   - Potential impact
   - Suggested fix

3. Wait 90 days before public disclosure
4. We'll credit you in security advisory

---

## 📚 Security Standards

### Compliance

- ✅ GDPR ready (privacy policy required)
- ✅ CCPA ready (data access/deletion)
- ✅ PCI DSS (via Stripe)
- ✅ SOC 2 (via Supabase)

### Certifications (Optional)

For production:
- [ ] SSL Certificate (Auto via Vercel)
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Security Audit

---

## 🔗 Security Resources

**Security Learning:**
- https://owasp.org/Top10/
- https://cheatsheetseries.owasp.org/
- https://securityheaders.com

**Tool Scanning:**
- https://www.ssllabs.com/ssltest/ (SSL check)
- https://securityheaders.com (Header check)
- npm audit (Dependency check)

**Monitoring:**
- Vercel Analytics
- Supabase Logs
- Browser console (development)

---

## 📞 Security Contact

**For security issues:**
- Email: security@yourdomain.com
- Response time: 24 hours
- Public disclosure: 90 days after fix

---

## 📋 Checklist for Team

When onboarding developers:

- [ ] Share SECURITY.md
- [ ] No secrets in code
- [ ] Use .env.local for development
- [ ] Never commit .env files
- [ ] Review code for security
- [ ] Test with security headers
- [ ] Use HTTPS in development
- [ ] Report issues privately

---

**Last Updated**: January 16, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅

---

*This security policy is a living document. Update as threats evolve and new vulnerabilities are discovered.*

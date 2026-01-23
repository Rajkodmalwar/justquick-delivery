# SMTP Email Setup Guide

## Overview

This guide helps you set up SMTP email sending to replace Supabase's rate-limited email service.

## Option 1: Resend (Recommended for Next.js)

### Setup

1. **Create Account**
   - Go to https://resend.com
   - Sign up (free tier available)
   - Verify domain

2. **Get API Key**
   - Dashboard → API Keys → Create new API key
   - Copy the API key

3. **Add to .env.local**
   ```bash
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   RESEND_FROM_EMAIL=noreply@justquick.delivery
   ```

4. **Install Package**
   ```bash
   pnpm add resend
   ```

### Pros
- ✅ Built for Next.js
- ✅ Free tier (100 emails/day)
- ✅ Easy integration
- ✅ No rate limiting issues
- ✅ Good deliverability

### Cons
- ❌ Requires domain verification
- ❌ Limited free tier

---

## Option 2: SendGrid (Enterprise Option)

### Setup

1. **Create Account**
   - Go to https://sendgrid.com
   - Sign up

2. **Get API Key**
   - Settings → API Keys → Create API Key
   - Choose "Full Access" or create restricted key
   - Copy the API key

3. **Add to .env.local**
   ```bash
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@justquick.delivery
   ```

4. **Install Package**
   ```bash
   pnpm add @sendgrid/mail
   ```

5. **Sender Authentication** (Important!)
   - Go to Settings → Sender Authentication
   - Verify single sender email (or domain)
   - This is required for production

### Pros
- ✅ Excellent deliverability
- ✅ High volume support (free tier: 100/day)
- ✅ Good analytics
- ✅ Reliable

### Cons
- ❌ Requires sender verification
- ❌ Slightly more complex setup

---

## Option 3: Mailgun

### Setup

1. **Create Account**
   - Go to https://mailgun.com
   - Sign up

2. **Get Credentials**
   - API → Domains
   - Copy "API Key"
   - Copy "Domain" (e.g., mg.yourdomain.com)

3. **Add to .env.local**
   ```bash
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=postmaster@mg.yourdomain.com
   SMTP_PASSWORD=your_mailgun_api_key
   SMTP_FROM_EMAIL=noreply@yourdomain.com
   SMTP_SECURE=false
   ```

4. **Install Package**
   ```bash
   pnpm add nodemailer
   pnpm add -D @types/nodemailer
   ```

### Pros
- ✅ Developer-friendly
- ✅ Good free tier (100/day)
- ✅ Flexible SMTP access
- ✅ Good documentation

### Cons
- ❌ Requires domain setup
- ❌ Custom domain needed

---

## Option 4: Gmail (Simple, for Testing)

### Setup

1. **Enable Less Secure App**
   - Google Account → Security
   - Enable "Less secure app access"
   - (NOT recommended for production)

2. **Get Credentials**
   - Email: your-email@gmail.com
   - Password: your-app-password (use 2FA password, not account password)

3. **Add to .env.local**
   ```bash
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM_EMAIL=your-email@gmail.com
   SMTP_SECURE=false
   ```

4. **Install Package**
   ```bash
   pnpm add nodemailer
   pnpm add -D @types/nodemailer
   ```

### Pros
- ✅ Free
- ✅ Easy setup
- ✅ Good for testing

### Cons
- ❌ Not for production
- ❌ Rate limited heavily
- ❌ Gmail security restrictions

---

## Option 5: AWS SES

### Setup

1. **Create AWS Account**
   - Go to https://aws.amazon.com
   - Sign up

2. **SES Setup**
   - Go to SES → Email Addresses/Domains
   - Verify your email or domain
   - Request production access (if needed)

3. **Create SMTP Credentials**
   - Go to SES → SMTP Settings
   - Create SMTP Credentials
   - Copy Username and Password

4. **Add to .env.local**
   ```bash
   EMAIL_PROVIDER=smtp
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-smtp-username
   SMTP_PASSWORD=your-smtp-password
   SMTP_FROM_EMAIL=your-verified-email@yourdomain.com
   SMTP_SECURE=false
   ```

5. **Install Package**
   ```bash
   pnpm add nodemailer
   pnpm add -D @types/nodemailer
   ```

### Pros
- ✅ Very cheap (0.10 per 1000 emails)
- ✅ Excellent deliverability
- ✅ Integration with AWS ecosystem

### Cons
- ❌ Complex AWS setup
- ❌ Requires domain verification
- ❌ Sandbox mode by default

---

## Environment Variables Template

Add to your `.env.local`:

```bash
# Email Configuration
EMAIL_PROVIDER=resend  # Options: resend, sendgrid, smtp, nodemailer

# For Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@justquick.delivery

# For SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@justquick.delivery

# For SMTP/Nodemailer (Mailgun, Gmail, AWS SES, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@justquick.delivery
SMTP_SECURE=false  # true for port 465, false for port 587
```

---

## Using the Email Service

### In API Routes

```typescript
import { sendEmail, EmailTemplates } from '@/lib/email'

// Send OTP
const result = await sendEmail({
  to: 'user@example.com',
  template: EmailTemplates.OTP_VERIFICATION,
  subject: 'Your Login Code',
  data: {
    otp: '123456'
  }
})

if (result.success) {
  console.log('Email sent:', result.messageId)
} else {
  console.error('Email failed:', result.error)
}
```

### Send OTP on Auth

```typescript
import { sendEmail, EmailTemplates } from '@/lib/email'

export async function POST(request: Request) {
  const { email, otp } = await request.json()

  // Send OTP email
  const emailResult = await sendEmail({
    to: email,
    template: EmailTemplates.OTP_VERIFICATION,
    subject: 'Your JustQuick Login Code',
    data: { otp }
  })

  if (!emailResult.success) {
    return Response.json(
      { error: 'Failed to send OTP email' },
      { status: 500 }
    )
  }

  return Response.json({ success: true })
}
```

### Send Order Confirmation

```typescript
await sendEmail({
  to: 'customer@example.com',
  template: EmailTemplates.ORDER_CONFIRMATION,
  subject: 'Order Confirmed - #12345',
  data: {
    orderId: '12345',
    items: [
      { name: 'Pizza', quantity: 2, price: 250 }
    ],
    total: 500,
    estimatedTime: '30-45 minutes'
  }
})
```

---

## Recommended Choice: Resend

**Why Resend?**
- ✅ Built for Next.js (perfect fit)
- ✅ Easiest setup (< 5 minutes)
- ✅ Free tier (100 emails/day)
- ✅ Great documentation
- ✅ Excellent deliverability
- ✅ No rate limiting issues

**Setup Time:** ~5 minutes  
**Cost:** Free up to 100/day, then $0.001 per email

---

## Testing Your Email Setup

Create a test route to verify emails are sending:

```typescript
// app/api/test/send-email/route.ts
import { sendEmail, EmailTemplates } from '@/lib/email'

export async function POST() {
  const result = await sendEmail({
    to: 'your-test-email@example.com',
    template: EmailTemplates.OTP_VERIFICATION,
    subject: 'Test Email',
    data: { otp: '123456' }
  })

  return Response.json(result)
}
```

Then: `curl -X POST http://localhost:3000/api/test/send-email`

---

## Troubleshooting

### Email not sending?
1. Check `EMAIL_PROVIDER` is set correctly
2. Check API key/SMTP credentials are correct
3. Check domain is verified (if required)
4. Check logs for error message

### Emails going to spam?
1. Set up SPF/DKIM records (SendGrid, Mailgun)
2. Use verified sender domain
3. Send from consistent email address
4. Include unsubscribe link (for bulk emails)

### Rate limiting?
1. Resend: Free tier is 100/day, switch to paid
2. SendGrid: Free tier is 100/day, switch to paid
3. Mailgun: Free tier is 100/day, switch to paid
4. AWS SES: Start in sandbox, request production

---

## Next Steps

1. Choose email provider (Resend recommended)
2. Follow setup instructions above
3. Add environment variables to `.env.local`
4. Update auth endpoints to use new email service
5. Test with test email
6. Deploy to production

---

**Questions?** Check provider documentation:
- Resend: https://resend.com/docs
- SendGrid: https://sendgrid.com/docs
- Mailgun: https://mailgun.com/docs
- AWS SES: https://docs.aws.amazon.com/ses/

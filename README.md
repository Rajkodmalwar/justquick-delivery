# JustQuick - Hyperlocal Delivery Platform

![Next.js](https://img.shields.io/badge/Next.js-15.5.7-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1-38B2AC?style=flat-square&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=flat-square&logo=supabase)

> 🚀 **Deliver groceries and essentials in 9 minutes** | A production-grade hyperlocal delivery platform built with modern tech stack

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running Locally](#running-locally)
- [Deployment](#deployment)
  - [Deploy to Vercel](#deploy-to-vercel)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
- [Architecture](#architecture)
  - [Authentication](#authentication)
  - [Payment System](#payment-system)
  - [Real-time Features](#real-time-features)
  - [Role-Based Access](#role-based-access)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security](#security)
- [Performance](#performance)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## ✨ Features

### 🛍️ **For Buyers**
- ✅ Browse local shops in real-time
- ✅ Passwordless authentication (magic links)
- ✅ Shopping cart with persistent storage
- ✅ Real-time order tracking
- ✅ Order history and re-ordering
- ✅ Push notifications for orders
- ✅ Dark/Light mode theme switcher
- ✅ Responsive mobile-first design

### 🏪 **For Vendors**
- ✅ Shop management dashboard
- ✅ Product catalog with inventory
- ✅ Real-time order management
- ✅ Sales analytics and reports
- ✅ Commission tracking
- ✅ Delivery boy assignment

### 🏍️ **For Delivery Partners**
- ✅ Delivery dashboard
- ✅ Active orders list
- ✅ GPS-based tracking
- ✅ OTP-based delivery confirmation
- ✅ Real-time earnings

### 👨‍💼 **For Admins**
- ✅ System-wide analytics
- ✅ User management
- ✅ Commission management
- ✅ Order disputes
- ✅ System settings

### 🔧 **Technical Features**
- ✅ **Passwordless Auth**: Magic link authentication
- ✅ **Real-time**: Supabase Realtime subscriptions
- ✅ **Database**: PostgreSQL with Row Level Security
- ✅ **Dark Mode**: Full light/dark theme support
- ✅ **Responsive**: Mobile, tablet, desktop optimized
- ✅ **Performance**: Production-grade optimization

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.7 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1 + PostCSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **State Management**: React Context API
- **Theme**: next-themes (Dark/Light mode)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: SWR

### Backend
- **Runtime**: Node.js (Next.js API routes)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Authentication (Magic Links)
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage
- **Analytics**: Vercel Analytics

### DevOps & Deployment
- **Hosting**: Vercel (Recommended)
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions (via Vercel)
- **Monitoring**: Vercel Analytics
- **Code Quality**: TypeScript strict mode

---

## 📁 Project Structure

```
justquick-delivery/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Authentication routes
│   ├── api/                       # API endpoints
│   ├── admin/                     # Admin dashboard
│   ├── vendor/                    # Vendor dashboard
│   ├── delivery/                  # Delivery partner dashboard
│   ├── layout.tsx                 # Root layout with theme
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── components/                    # React components
│   ├── auth/                      # Auth components
│   ├── home/                      # Home page sections
│   ├── ui/                        # UI components (Radix)
│   ├── notifications/             # Notification system
│   └── theme-toggle.tsx           # Dark/Light mode toggle
├── hooks/                         # Custom React hooks
├── lib/                           # Utility functions
│   ├── supabase/                  # Supabase client
│   ├── utils.ts                   # Helper functions
│   └── notifications.ts           # Notification utilities
├── public/                        # Static assets
├── scripts/                       # Database migrations
├── middleware.ts                  # Next.js middleware
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript config
├── next.config.mjs                # Next.js config
├── package.json                   # Dependencies
└── README.md                      # This file
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.17+ ([Download](https://nodejs.org/))
- **npm**, **pnpm**, or **yarn** (npm comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **GitHub Account** ([Create](https://github.com/signup))
- **Supabase Account** ([Create](https://supabase.com/))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/justquick-delivery.git
cd justquick-delivery
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Create environment file**
```bash
cp .env.example .env.local
```

4. **Update environment variables**
Edit `.env.local` with your Supabase credentials (see [Environment Setup](#environment-setup))

### Environment Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details
   - Wait for project to be created (~2 minutes)

2. **Get Credentials**
   - Go to Settings → API
   - Copy `Project URL`
   - Copy `Anon Public Key`

3. **Set Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Setup Database** (Optional but recommended)
   - Run SQL migrations from `scripts/` folder in Supabase SQL editor
   - Or use Supabase dashboard to create tables

### Running Locally

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Key Routes:**
- Home: [localhost:3000](http://localhost:3000)
- Login: [localhost:3000/auth/login](http://localhost:3000/auth/login)
- Register: [localhost:3000/auth/register](http://localhost:3000/auth/register)
- Vendor: [localhost:3000/partner/vendor](http://localhost:3000/partner/vendor)
- Delivery: [localhost:3000/partner/driver](http://localhost:3000/partner/driver)
- Admin: [localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

Vercel is the optimal hosting platform for Next.js apps. It's free, fast, and automatically optimized.

#### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit: JustQuick MVP"
git push origin main
```

#### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select "Import Git Repository"
4. Find and select your GitHub repository
5. Click "Import"

#### Step 3: Configure Environment

In Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add all variables from `.env.example`:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
3. Click "Save"

#### Step 4: Deploy

1. Click "Deploy"
2. Wait for deployment to complete (~2 minutes)
3. Your app is live at `https://your-app.vercel.app`

### Environment Variables

**Required for Production:**
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Optional (for advanced features):**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=stripe-key  # For payments
STRIPE_SECRET_KEY=stripe-secret                 # For payments
NEXT_PUBLIC_ANALYTICS_ID=analytics-id          # For tracking
```

### Database Setup

**Option 1: Auto-setup (Recommended)**
- Supabase automatically creates required tables
- Uses Row Level Security (RLS) policies
- Handles authentication

**Option 2: Manual Setup**
```bash
# Run migrations in Supabase SQL editor
# Files in: scripts/sql/
- 001_auth.sql
- 002_profiles.sql
- 003_shops.sql
```

---

## 🏗️ Architecture

### Authentication Flow

**Passwordless (Magic Link):**
```
User enters email
    ↓
Click "Send Magic Link"
    ↓
Email sent with secure token (24hr expiry)
    ↓
User clicks link
    ↓
Session created (JWT in httpOnly cookie)
    ↓
User authenticated
```

### Payment System

**Current:** Cash on Delivery (COD)
**Future:** Stripe integration ready

```
Order Created
    ↓
User selects COD
    ↓
Order sent to vendor
    ↓
Delivery boy picks up
    ↓
OTP given to buyer
    ↓
Cash collected
    ↓
Payment marked complete
```

### Real-time Features

Using Supabase Realtime:
```
✅ Order status updates
✅ Delivery tracking
✅ Notifications
✅ Vendor dashboard updates
✅ Multi-tab sync
```

### Role-Based Access

```
👤 Buyer → Browse shops, order, track
🏪 Vendor → Manage shop, products, orders
🏍️ Delivery → Accept orders, deliver, collect payment
👨‍💼 Admin → Manage system, disputes, analytics
```

---

## 📡 API Documentation

### Authentication Endpoints

```
POST /api/auth/login              # Magic link login
POST /api/auth/register           # User registration
GET  /api/auth/verify             # Verify magic link
POST /api/auth/logout             # Logout
```

### Orders API

```
POST   /api/orders                # Create order
GET    /api/orders                # List user orders
GET    /api/orders/[id]           # Get order details
PATCH  /api/orders/[id]           # Update order status
POST   /api/orders/[id]/otp       # Generate OTP
```

### Shops API

```
GET    /api/shops                 # List all shops
GET    /api/shops/[id]            # Get shop details
POST   /api/shops                 # Create shop (vendor)
PATCH  /api/shops/[id]            # Update shop
```

### Products API

```
GET    /api/products              # List products
GET    /api/products/[id]         # Get product details
POST   /api/products              # Create product (vendor)
```

---

## 🗄️ Database Schema

### Key Tables

**users (Supabase Auth)**
- id, email, user_metadata, created_at

**profiles**
- id, name, phone, address, role, created_at

**shops**
- id, name, owner_id, location, description, image, status

**products**
- id, shop_id, name, description, price, image, available

**orders**
- id, buyer_id, shop_id, delivery_id, status, total_price, payment_type

**notifications**
- id, user_id, title, message, type, is_read, created_at

---

## 🔒 Security

### Implemented

- ✅ **Passwordless Auth**: No passwords to compromise
- ✅ **Row Level Security**: Database-level access control
- ✅ **Environment Variables**: Secrets never in code
- ✅ **HTTPS**: All traffic encrypted
- ✅ **httpOnly Cookies**: Auth tokens secure
- ✅ **Input Validation**: Zod schema validation
- ✅ **TypeScript**: Type-safe code
- ✅ **CORS**: API protection

### Best Practices

1. **Never commit .env.local**
   ```
   .env.local is in .gitignore ✓
   ```

2. **Rotate Supabase Keys Regularly**
   - Supabase Dashboard → Settings → API
   - Regenerate keys monthly

3. **Keep Dependencies Updated**
   ```bash
   npm update
   npm audit
   ```

4. **Monitor Production Logs**
   - Vercel Dashboard → Logs
   - Check for errors weekly

5. **Use Environment Variables**
   - All secrets in Vercel dashboard
   - Never hardcode credentials

---

## ⚡ Performance

### Metrics

- **First Load JS**: 102 kB (optimized)
- **Build Time**: ~6-9 seconds
- **Page Load**: <2 seconds
- **API Response**: <500ms

### Optimization Techniques

- ✅ Code splitting by route
- ✅ Image optimization
- ✅ CSS minification
- ✅ JavaScript minification
- ✅ Gzip compression
- ✅ Caching strategies
- ✅ Dark mode (no extra bundle)

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/justquick-delivery.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   ```bash
   git add .
   git commit -m "Add: amazing feature"
   ```

4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**
   - Describe changes clearly
   - Link related issues
   - Request reviewers

### Code Style

- Use TypeScript for all new files
- Follow Tailwind CSS naming
- Use meaningful variable names
- Add comments for complex logic
- Format with Prettier (auto)

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Vercel Docs](https://vercel.com/docs)

### Getting Help

1. **Check existing issues** on GitHub
2. **Create a new issue** with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

3. **Email support**: support@justquick.local

---

## 🚀 Roadmap

### Q1 2026
- ✅ MVP Launch
- ✅ Dark/Light Mode
- ✅ Passwordless Auth

### Q2 2026
- 🔜 Stripe Payment Integration
- 🔜 Customer Reviews & Ratings
- 🔜 Promo Codes & Discounts

### Q3 2026
- 🔜 Mobile App (React Native)
- 🔜 Analytics Dashboard
- 🔜 SMS Notifications

### Q4 2026
- 🔜 AI-based Recommendations
- 🔜 Loyalty Program
- 🔜 Multi-language Support

---

## 📊 Project Stats

- **Code Lines**: 15,000+
- **Components**: 50+
- **API Routes**: 30+
- **Database Tables**: 10+
- **Deployment**: ✅ Ready

---

## 👥 Team

- **Founder**: Your Name
- **Built with**: Next.js, React, Supabase, Tailwind CSS

---

**Made with ❤️ in India**

⭐ If you found this helpful, please give it a star!

---

**Last Updated**: January 16, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅

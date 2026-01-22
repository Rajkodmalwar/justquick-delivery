# JustQuick - Hyperlocal Delivery MVP2 - Folder Structure Blueprint

```
hyperlocaldeliverymvp2/
│
├── app/                                 # Next.js App Router
│   ├── layout.tsx                      # Root layout with providers
│   ├── page.tsx                        # Home page
│   ├── globals.css                     # Global styles
│   │
│   ├── admin/                          # Admin Portal
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   ├── debug/
│   │   └── login/
│   │
│   ├── api/                            # API Routes
│   │   ├── admin/                      # Admin APIs
│   │   ├── auth/                       # Authentication APIs
│   │   │   ├── logout/
│   │   │   ├── send-otp/
│   │   │   ├── session/
│   │   │   ├── signup/
│   │   │   ├── upsert-profile/
│   │   │   └── verify-otp/
│   │   ├── commissions/                # Commission APIs
│   │   ├── debug/                      # Debug utilities
│   │   ├── delivery/                   # Delivery APIs
│   │   ├── delivery-boys/              # Delivery boys management
│   │   ├── notifications/              # Notification APIs
│   │   ├── orders/                     # Order management
│   │   ├── products/                   # Product APIs
│   │   ├── settings/                   # App settings
│   │   ├── shops/                      # Shop APIs
│   │   └── upload/                     # File upload APIs
│   │
│   ├── auth/                           # Auth Pages
│   │   ├── callback/
│   │   ├── error/
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── register/
│   │   ├── reset-password/
│   │   ├── verify/
│   │   └── verify-email/
│   │
│   ├── cart/                           # Shopping cart
│   │   └── page.tsx
│   │
│   ├── debug/                          # Debug pages
│   │   └── auth/
│   │
│   ├── debug-session/
│   │   └── page.tsx
│   │
│   ├── delivery/                       # Delivery portal
│   │   ├── loading.tsx
│   │   └── page.tsx
│   │
│   ├── logout/
│   │   └── page.tsx
│   │
│   ├── my-orders/                      # User orders
│   │   └── page.tsx
│   │
│   ├── notifications/                  # Notification center
│   │   └── page.tsx
│   │
│   ├── orders/                         # Order pages
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   └── admin/
│   │
│   ├── partner/                        # Partner portals
│   │   ├── driver/
│   │   └── vendor/
│   │
│   ├── profile/                        # User profile
│   │   └── page.tsx
│   │
│   ├── shops/                          # Shop listing & details
│   │   ├── page.tsx
│   │   └── [id]/
│   │
│   └── vendor/                         # Vendor portal
│       ├── loading.tsx
│       └── page.tsx
│
├── components/                         # React Components
│   ├── theme-provider.tsx              # Theme context
│   ├── theme-toggle.tsx                # Dark mode toggle
│   │
│   ├── auth/                           # Authentication Components
│   │   ├── auth-modal.tsx
│   │   ├── auth-provider.tsx           # ⭐ Main auth context with profile creation
│   │   ├── auth-provider-clean.tsx     # [DEPRECATED - deleted]
│   │   ├── driver-login-modal.tsx
│   │   ├── user-menu.tsx               # User dropdown menu
│   │   └── vendor-login-modal.tsx
│   │
│   ├── buyer/                          # Buyer-specific components
│   │   ├── buyer-login.tsx
│   │   ├── cart-context.tsx            # ⭐ Shopping cart context (uses auth profile)
│   │   ├── cart-drawer.tsx
│   │   ├── otp-screen.tsx
│   │   ├── product-card.tsx
│   │   ├── product-list.tsx
│   │   └── user-status.tsx
│   │
│   ├── home/                           # Home page components
│   │   ├── bottom-nav.tsx
│   │   ├── categories-section.tsx
│   │   ├── dashboard-section.tsx
│   │   ├── features-grid.tsx
│   │   ├── hero-section.tsx
│   │   ├── notification-toast.tsx
│   │   ├── partner-section.tsx
│   │   ├── promo-banner.tsx
│   │   ├── recent-orders.tsx
│   │   ├── search-and-location.tsx
│   │   ├── shop-grid.tsx
│   │   └── trending-section.tsx
│   │
│   ├── notifications/                  # Notification components
│   │   ├── NotificationBell.tsx
│   │   └── NotificationBellClient.tsx
│   │
│   └── ui/                             # Reusable UI components
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button-group.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       └── ... (more UI components)
│
├── hooks/                              # Custom React Hooks
│   ├── use-buyer.ts                    # Buyer-related hooks
│   ├── use-mobile.ts                   # Mobile detection
│   └── use-toast.ts                    # Toast notifications
│
├── lib/                                # Utility functions & services
│   ├── geo.ts                          # Geolocation utilities
│   ├── notifications.ts                # Notification logic
│   ├── order-timeline.ts               # Order status timeline
│   ├── utils.ts                        # General utilities
│   │
│   ├── supabase/                       # Supabase client & helpers
│   │   └── ... (client config)
│   │
│   └── utils/                          # Additional utilities
│       └── ... (helper functions)
│
├── public/                             # Static assets
│   └── ... (images, icons, etc.)
│
├── scripts/                            # Database & utility scripts
│   ├── 002_add_buyer_address.sql
│   ├── 003_add_product_availability.sql
│   └── sql/
│
├── styles/                             # Global styles
│   └── globals.css
│
├── types/                              # TypeScript type definitions
│   └── ... (type files)
│
├── middleware.ts                       # Next.js middleware
├── next-env.d.ts                       # Next.js types
├── next.config.mjs                     # Next.js config
├── tsconfig.json                       # TypeScript config
├── package.json                        # Dependencies
├── pnpm-lock.yaml                      # Dependency lock file
├── postcss.config.mjs                  # PostCSS config
├── components.json                     # shadcn/ui config
├── vercel.json                         # Vercel deployment config
└── .env.local                          # Environment variables
```

## Key Directories Summary

### 🔐 Authentication & Context
- **components/auth/** - Authentication components & AuthProvider
- **components/buyer/cart-context.tsx** - Shopping cart context
- **hooks/** - Custom React hooks

### 🛍️ E-Commerce Pages
- **app/shops/** - Shop listing and details
- **app/orders/** - Order management
- **app/cart/** - Shopping cart page
- **components/buyer/** - Buyer UI components

### 👥 User Roles
- **app/vendor/** - Vendor portal
- **app/delivery/** - Delivery driver portal
- **app/admin/** - Admin dashboard
- **app/partner/** - Partner pages (vendor/driver)

### 🔧 API Routes
- **app/api/auth/** - Authentication endpoints
- **app/api/orders/** - Order APIs
- **app/api/products/** - Product APIs
- **app/api/shops/** - Shop APIs
- **app/api/notifications/** - Push notifications

### 📚 Shared Utilities
- **lib/supabase/** - Supabase client setup
- **lib/utils.ts** - Helper functions
- **components/ui/** - Reusable UI components (shadcn/ui)

## Authentication Flow Architecture

```
User Login
    ↓
AuthProvider (components/auth/auth-provider.tsx)
    ├─ Fetches session from Supabase
    ├─ Fetches user profile from public.profiles table
    ├─ If profile missing → AUTO-CREATE with INSERT
    ├─ If profile exists → USE IT
    └─ Exposes: user, profile, loading, role, isAdmin, isBuyer, isVendor, isDelivery
        ↓
CartContext (components/buyer/cart-context.tsx)
    ├─ Consumes profile from AuthProvider
    ├─ Syncs buyer data
    └─ Manages cart state

Components
    ├─ Use useAuth() hook → get user, profile, role
    ├─ Use useCart() hook → get cart items, buyer info
    └─ Conditional rendering based on role
```

## Current Status

✅ **Consolidated Auth** - Single AuthProvider (auth-provider-clean.tsx deleted)
✅ **Profile Centralization** - AuthProvider fetches/creates profile once
✅ **Auto-Profile Creation** - New users get profile auto-created on login
✅ **RLS Compliant** - Uses anon client, respects Supabase RLS policies
✅ **No 403 Errors** - Profile missing → auto-created
✅ **TypeScript Safe** - Full type coverage

## Next Steps (When Needed)

⏳ Role-based routing (Redirect based on profile.role)
⏳ Permission system (API endpoint access control)
⏳ UI refactoring (Based on auth state)

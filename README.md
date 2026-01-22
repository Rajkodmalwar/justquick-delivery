# JustQuick Delivery - Hyperlocal Delivery MVP

A modern, full-stack hyperlocal delivery platform built with Next.js 15, Supabase, and Tailwind CSS. Connects buyers with local shops, vendors, and delivery partners for same-day delivery.

## 🌟 Features

### 👤 Buyer Features
- **User Authentication**: Email-based OTP verification
- **Shop Discovery**: Browse nearby shops and products
- **Shopping Cart**: Add/remove items, persistent storage
- **Order Placement**: Real-time order creation with Supabase
- **Order Tracking**: Real-time order status updates via Supabase subscriptions
- **Delivery Timeline**: Visual progress indicator with estimated delivery times
- **Profile Management**: Save address, phone, and delivery preferences
- **Notifications**: In-app and real-time order notifications
- **Multiple Roles**: Support for buyers, vendors, and delivery partners

### 🏪 Vendor Features
- **Vendor Dashboard**: Manage shop and products
- **Product Management**: Add, edit, delete products with image uploads
- **Order Management**: Accept/reject orders, manage fulfillment
- **Commission Tracking**: View commissions and payouts
- **Settings**: Configure shop details and delivery zones

### 🚗 Delivery Partner Features
- **Delivery Dashboard**: View assigned orders
- **Order Status Updates**: Mark orders as picked up/delivered
- **Route Optimization**: See delivery locations on map
- **OTP Verification**: Confirm deliveries with OTP codes
- **Availability Status**: Toggle availability for orders

### 🔧 Admin Features
- **Order Management**: Complete order lifecycle control
- **Delivery Boy Assignment**: Auto-assign or manual assignment
- **Order Analytics**: View orders by status, revenue, etc.
- **Notification System**: Send targeted notifications to users
- **Settings Management**: Configure delivery fees, zones, commissions
- **Product Management**: Add products, manage inventory
- **Commission Tracking**: Monitor vendor commissions

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **Lucide React** - Icon library
- **date-fns** - Date manipulation
- **SWR** - Data fetching with caching

### Backend
- **Next.js API Routes** - Serverless endpoints
- **Supabase** - PostgreSQL database + Auth
- **Supabase RLS** - Row-level security policies
- **Supabase Real-time** - WebSocket subscriptions for live updates

### Infrastructure
- **Vercel** - Deployment platform
- **PostgreSQL** - Database engine
- **Environment Variables** - Secure configuration

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- Supabase account
- Git

### 1. Clone Repository
```bash
git clone https://github.com/Rajkodmalwar/justquick-delivery.git
cd justquick-delivery
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Email service for notifications
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Database Setup
- Create Supabase project
- Run SQL migrations from `scripts/` directory
- Set up RLS policies for tables
- Configure Supabase auth providers

### 5. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000)

### 6. Build for Production
```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   ├── auth/                     # Authentication pages
│   ├── admin/                    # Admin dashboard
│   ├── orders/[id]/              # Order tracking
│   ├── profile/                  # User profile
│   └── ...                       # Other routes
├── components/                   # Reusable React components
│   ├── auth/                     # Auth-related components
│   ├── buyer/                    # Buyer-specific components
│   ├── home/                     # Home page sections
│   ├── admin/                    # Admin dashboard components
│   └── ui/                       # Shadcn UI components
├── lib/                          # Utility functions
│   ├── supabase/                 # Supabase client setup
│   ├── logger.ts                 # Production-safe logging
│   ├── utils.ts                  # Helper functions
│   └── ...                       # Other utilities
├── hooks/                        # Custom React hooks
│   ├── use-buyer.ts              # Buyer authentication
│   └── use-toast.ts              # Toast notifications
├── public/                       # Static assets
├── scripts/                      # SQL migration scripts
└── middleware.ts                 # Next.js middleware
```

## 🔐 Security Features

### Authentication & Authorization
- **Email OTP**: Secure passwordless login for buyers
- **Password Auth**: Admin login with email/password
- **Supabase RLS**: Row-level security on database queries
- **Middleware**: Protected routes with auth checks

### API Security
- **HTTPS Enforced**: All traffic encrypted
- **Security Headers**: 
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: Geolocation, microphone, camera disabled
- **HSTS**: Strict transport security enabled
- **CORS**: Cross-origin requests controlled

### Data Protection
- **Console Logs Hidden**: Production-only logger utility (no sensitive data leaked)
- **Environment Variables**: All secrets server-side only
- **Secure Cookies**: HttpOnly, Secure, SameSite flags set
- **Input Validation**: All API endpoints validate user inputs

### Code Quality
- **TypeScript**: Type-safe development prevents many bugs
- **ESLint**: Code linting and standards
- **Error Handling**: Comprehensive error handling with user feedback

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and create session
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/logout` - Logout user

### Order Endpoints
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details
- `PATCH /api/orders/[id]/status` - Update order status

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications` - Mark as read

### Shop Endpoints
- `GET /api/shops` - Get nearby shops
- `GET /api/shops/[id]` - Get shop details
- `GET /api/products` - Get products by shop

### Admin Endpoints
- `GET /api/admin/orders` - View all orders
- `POST /api/admin/orders/[id]/assign` - Assign delivery boy
- `PATCH /api/admin/settings` - Update app settings

## 🚀 Deployment

### Deploy to Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# Connect repository in Vercel dashboard
# Set environment variables
# Deploy with one click
```

### Manual Deployment
```bash
# Build
pnpm build

# Deploy to your server
# Set environment variables
# Start production server
pnpm start
```

## 🗄️ Database Schema

### Key Tables
- **users** - User accounts and profiles
- **profiles** - Extended user information (address, phone)
- **shops** - Shop details and metadata
- **products** - Product inventory
- **orders** - Order records with status
- **order_items** - Items in each order
- **notifications** - User notifications
- **delivery_boys** - Delivery partner profiles
- **commissions** - Vendor commission tracking

## 📊 Real-time Features

### Supabase Subscriptions
- **Orders**: Real-time status updates
- **Notifications**: Instant delivery notifications
- **Products**: Live inventory updates
- **Delivery**: Real-time delivery tracking

## 🔧 Development Tips

### Debugging
- Open browser DevTools to check network requests
- Use `/debug-session` to inspect auth session
- Check `/debug/auth` for auth debugging
- Server logs available in Vercel dashboard

### Database
- Use Supabase Studio to view/edit data
- Monitor RLS policies for permission issues
- Check auth policies if queries return no data

### Performance
- Check Next.js build output for bundle size
- Use React DevTools Profiler to identify slow components
- Monitor Supabase query performance

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | Yes | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | Supabase anon key |
| NEXT_PUBLIC_API_URL | No | API base URL |
| NODE_ENV | Auto | Development/production |

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is private. Do not use or distribute without permission.

## 🆘 Support

For issues and questions:
- Check existing GitHub issues
- Create new issue with detailed description
- Include steps to reproduce
- Attach error messages and logs

## 📞 Contact

- GitHub: [@Rajkodmalwar](https://github.com/Rajkodmalwar)
- Issues: Use GitHub Issues

---

**Built with ❤️ using Next.js, Supabase, and Tailwind CSS**

*Last Updated: January 2026*

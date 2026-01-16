# Component Usage Guide

## Quick Start: Using Home Components

All home page components are designed to be:
- **Self-contained** - No shared state between components
- **Data-agnostic** - They receive props, don't fetch data
- **Reusable** - Can be used on partner pages, landing pages, etc.

---

## Hero Section

### Purpose
Premier "above the fold" section with value prop and primary CTA.

### Props
```typescript
interface HeroSectionProps {
  isAuthenticated: boolean
  unreadNotifications: number
}
```

### Usage
```tsx
<HeroSection
  isAuthenticated={isAuthenticated}
  unreadNotifications={unreadNotifications}
/>
```

### Key Features
- Responsive grid (1 col mobile, 2 col desktop)
- Gradient headline with cyan accent
- Trust indicators (orders, rating, availability)
- Primary CTA button with glow effect
- Optional: Notifications button (shows if unread > 0)

### Customization
To change headline:
```tsx
// In hero-section.tsx, line 27
<h1 className="...">Groceries in <span className="...">9 minutes</span></h1>
```

To add/remove trust indicators:
```tsx
// Around line 60, modify the grid
<div className="flex items-center gap-6 mt-10...">
  <div>
    <p className="text-2xl font-bold text-cyan-400">15k+</p>
    <p className="text-sm text-slate-400">Active orders</p>
  </div>
  {/* Add/remove divs here */}
</div>
```

---

## Features Grid

### Purpose
Quickly communicate 4 key value props (9-min delivery, safety, quality, free delivery).

### Props
None - features are hardcoded.

### Usage
```tsx
<FeaturesGrid />
```

### Key Features
- 4 columns on desktop, 2 on mobile
- Consistent card styling with hover effects
- Icon + title + description layout
- Color-coded icons (cyan, emerald, amber, blue)

### Customization
To change a feature:
```tsx
// In features-grid.tsx, update the features array
const features = [
  {
    icon: Clock,
    title: "9-Minute Delivery", // Change this
    description: "Superfast hyperlocal delivery", // And this
    color: "text-cyan-400" // And color
  },
  // ...
]
```

---

## Categories Section

### Purpose
Allow customers to browse by product category.

### Props
None - categories are hardcoded.

### Usage
```tsx
<CategoriesSection />
```

### Key Features
- 6 categories: Groceries, Fast Food, Beverages, Desserts, Alcohol, Essentials
- 2 cols mobile, 3 tablet, 6 desktop
- Icon hover animation (scale up)
- Links to `/shops?category=...`

### Customization
To add/edit categories:
```tsx
// In categories-section.tsx, update the categories array
const categories = [
  { name: "Groceries", icon: Package, color: "text-emerald-400" },
  { name: "Fast Food", icon: Pizza, color: "text-orange-400" },
  // Add new category here
  { name: "Books", icon: BookOpen, color: "text-blue-400" },
  // ...
]
```

---

## Dashboard Section

### Purpose
Show authenticated users their recent orders and alerts.

### Props
```typescript
interface DashboardSectionProps {
  recentOrders: any[]
  notifications: any[]
  unreadNotifications: number
}
```

### Usage
```tsx
{isAuthenticated && user && (
  <DashboardSection
    recentOrders={recentOrders}
    notifications={notifications}
    unreadNotifications={unreadNotifications}
  />
)}
```

### Key Features
- 2-column layout: Orders (2/3 width) + Notifications (1/3)
- Each order links to detail page (`/orders/{id}`)
- Status badges (pending, delivered, etc.)
- Notifications with unread indicators
- Empty states with CTAs

### Data Structure
**Orders:**
```typescript
{
  id: string
  created_at: string
  status: 'pending' | 'accepted' | 'ready' | 'picked_up' | 'delivered' | 'rejected'
  total_price: number
}
```

**Notifications:**
```typescript
{
  id: string
  title: string
  message: string
  created_at: string
  is_read: boolean
  metadata?: { action: string }
}
```

### Customization
To change empty state message:
```tsx
// Around line 70
<div className="text-center py-12">
  <div className="inline-flex p-3 rounded-lg bg-slate-800/50 mb-4">
    <ShoppingCart className="h-8 w-8 text-slate-400" />
  </div>
  <p className="text-slate-400 font-medium mb-2">No orders yet</p>
  {/* Edit message here */}
</div>
```

---

## Trending Section

### Purpose
Showcase popular products to drive impulse purchases.

### Props
None - products are hardcoded.

### Usage
```tsx
<TrendingSection />
```

### Key Features
- 4 product cards (responsive: 2 cols mobile, 4 desktop)
- Product image placeholder
- Rating badge with star
- Price prominent
- "Add to Cart" button

### Customization
To add/edit products:
```tsx
// In trending-section.tsx, update trendingProducts array
const trendingProducts = [
  { name: "Fresh Apples", price: "₹89", shop: "Fresh Mart", rating: 4.5 },
  // Add new product
  { name: "Milk", price: "₹50", shop: "Dairy Plus", rating: 4.8 },
  // ...
]
```

To connect "Add to Cart":
```tsx
// Replace the button with real handler
<Button onClick={() => addToCart(product)}>
  Add to Cart
</Button>
```

---

## Partner Section

### Purpose
Promote vendor and driver onboarding.

### Props
None - stats are hardcoded.

### Usage
```tsx
<PartnerSection />
```

### Key Features
- 2-column layout: Copy + Stats grid
- Stats in 2x2 grid (Partner Stores, Drivers, Orders, Rating)
- CTAs: "Register Shop" and "Become Driver"
- Glass morphism card design

### Customization
To change stats:
```tsx
// In partner-section.tsx, update stats array
const stats = [
  { icon: Store, label: "Partner Stores", value: "150+", color: "text-cyan-400" },
  // Edit values here
]
```

To change CTAs:
```tsx
// Around line 40, update links
<Link href="/partner/vendor">
  <Button>Register Shop</Button>
</Link>
```

---

## Notification Toast

### Purpose
Display real-time notifications from server (order updates, alerts).

### Props
```typescript
interface NotificationToastProps {
  notification: any | null
  show: boolean
  onDismiss: () => void
}
```

### Usage
In `page.tsx`:
```tsx
<NotificationToast
  notification={lastNotification}
  show={showNotificationToast}
  onDismiss={() => setShowNotificationToast(false)}
/>
```

### Key Features
- Fixed position (top-right)
- Auto-dismisses after 5 seconds
- Manual dismiss button
- Smooth slide-in animation
- Cyan accent styling

### Data Structure
```typescript
{
  title: string
  message: string
  // Shown "Just now"
}
```

---

## Composition in Page

### Full Page Structure
```tsx
export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotificationToast, setShowNotificationToast] = useState(false)
  const [lastNotification, setLastNotification] = useState<any>(null)

  // Data fetching & realtime setup
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecentOrders()
      fetchRecentNotifications()
      setupRealtimeNotifications()
    }
  }, [isAuthenticated, user])

  // Handle incoming notifications
  const handleNewNotification = (notification: any) => {
    setLastNotification(notification)
    setShowNotificationToast(true)
    setNotifications(prev => [notification, ...prev])
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <NotificationToast {...} />
      <HeroSection {...} />
      <FeaturesGrid />
      <CategoriesSection />
      {isAuthenticated && <DashboardSection {...} />}
      <TrendingSection />
      <PartnerSection />
    </main>
  )
}
```

---

## Styling Cheat Sheet

### Common Classes
```tsx
// Backgrounds
bg-slate-950        // Page background
bg-slate-800/50     // Card background
bg-slate-900/30     // Subtle background
from-slate-800/50 to-slate-900/50  // Gradient card

// Text
text-white          // Primary text
text-slate-300      // Secondary text
text-slate-400      // Muted text
text-cyan-400       // Accent text

// Borders
border-slate-700/50     // Card border
hover:border-cyan-500/30  // On hover

// Buttons
btn-primary-glow    // Gradient cyan→blue with shadow
variant="outline"   // Slate border + hover
variant="ghost"     // No background, text only

// Interactive
rounded-lg          // Standard border radius
rounded-xl          // Large border radius
shadow-lg shadow-cyan-500/30  // Colored glow

// Responsive
grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6
px-4 sm:px-6 lg:px-8
```

---

## Testing Checklist

When adding new components or modifying:

- [ ] Component accepts correct props
- [ ] Empty states render correctly
- [ ] Links navigate to correct pages
- [ ] Icons render without errors
- [ ] Text is readable (color contrast)
- [ ] Responsive: mobile → tablet → desktop
- [ ] Hover states work smoothly
- [ ] No console errors
- [ ] Images/placeholders load
- [ ] z-index ordering is correct (toasts on top)

---

## Performance Tips

1. **Avoid re-renders:** Memoize components if props are static
   ```tsx
   export const FeaturesGrid = memo(() => { ... })
   ```

2. **Lazy load sections below fold:**
   ```tsx
   const TrendingSection = dynamic(() => import('...'), { loading: () => <Skeleton /> })
   ```

3. **Keep component bundles small:** Each component <5KB

4. **Image optimization:**
   - Use `next/image` for real images
   - Placeholder SVGs for now

---

## Troubleshooting

### Component not showing
- Check if it's behind an auth check (`{isAuthenticated && <Component />}`)
- Check props are passed correctly
- Open DevTools → Console for errors

### Styling looks wrong
- Ensure `dark` class is on `<html>` tag
- Check Tailwind is building (`npm run build`)
- Verify color names (e.g., `slate-50` not `slate-100`)

### Buttons look wrong
- Check variant prop: `default`, `outline`, `secondary`, `ghost`
- Check size prop: `sm`, `default`, `lg`
- Don't mix inline styles with Tailwind classes

### Layout breaks on mobile
- Use responsive prefixes: `sm:`, `lg:`, etc.
- Test on actual device, not just browser zoom
- Use `max-w-7xl` for max width, not fixed pixel widths

---

## Adding New Sections

### Template
```tsx
"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface NewSectionProps {
  // Define props here
}

export function NewSection({ /* props */ }: NewSectionProps) {
  return (
    <section className="relative py-16 sm:py-24 border-b border-slate-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section content */}
      </div>
    </section>
  )
}
```

### Remember
1. Add `"use client"` at top
2. Use consistent spacing: `py-16 sm:py-24`
3. Use `max-w-7xl` for max width
4. Add border-bottom for visual separation
5. Responsive padding: `px-4 sm:px-6 lg:px-8`
6. Use existing components (Card, Button, Badge)
7. Follow color/style conventions

---

**Last Updated:** January 16, 2026
**Version:** 1.0
**Next Review:** After first analytics report

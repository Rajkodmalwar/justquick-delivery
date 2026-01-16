# JustQuick - Developer Quick Reference

## Color Classes (Dark Theme Only)

### Background
```
bg-slate-950  // Main background (deep)
bg-slate-900  // Cards, elevated surfaces
bg-slate-800  // Hover states
bg-slate-700  // Focus/active states
```

### Text
```
text-slate-100  // Primary text
text-slate-300  // Secondary text
text-slate-400  // Muted text
text-slate-500  // Disabled text
```

### Accents
```
text-cyan-400   // Primary CTA text, icons
text-cyan-500   // Buttons, active states
text-blue-500   // Secondary accents
bg-cyan-500/20  // Subtle backgrounds
```

### Borders
```
border-slate-700/50  // Subtle borders
border-cyan-500/30   // Hover borders
border-slate-600     // Darker borders
```

---

## Component Patterns

### Button Variants
```tsx
// Primary (default gradient)
<Button>Order Now</Button>

// Secondary (outline)
<Button variant="outline">Browse</Button>

// Ghost (no background)
<Button variant="ghost">Skip</Button>

// With icon
<Button>
  <ShoppingCart className="h-5 w-5" />
  Add to Cart
</Button>
```

### Card Pattern
```tsx
<Card className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-700/50">
  {/* Content */}
</Card>
```

### Section Layout
```tsx
<section className="py-20 md:py-32 border-b border-slate-800/50">
  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    {/* Content */}
  </div>
</section>
```

### Group Hover (Icon scale)
```tsx
<div className="group">
  <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
</div>
```

---

## Grid Patterns

### Hero (Centered)
```tsx
<section className="bg-slate-950 pt-20 pb-32 md:pt-32 md:pb-48">
  <div className="mx-auto max-w-6xl px-4">
    <div className="text-center">
      {/* Centered content */}
    </div>
  </div>
</section>
```

### Features (4 Column)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* 4 feature cards */}
</div>
```

### Categories (6 Column)
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
  {/* 6 category cards */}
</div>
```

### 2-Column (Text + Visual)
```tsx
<div className="grid lg:grid-cols-2 gap-12 items-center">
  <div>{/* Left: Copy */}</div>
  <div>{/* Right: Visual/Stats */}</div>
</div>
```

---

## Common Tailwind Classes

### Spacing
```
p-4    // Padding all sides
px-4   // Padding left + right
py-4   // Padding top + bottom
gap-4  // Space between flex/grid items
mb-8   // Margin bottom
mt-6   // Margin top
```

### Display
```
hidden           // display: none
block            // display: block
flex             // display: flex
grid             // display: grid
inline-flex      // display: inline-flex
items-center     // align-items: center
justify-between  // justify-content: space-between
gap-4            // gap for flex/grid
```

### Typography
```
font-bold        // font-weight: 700
font-semibold    // font-weight: 600
text-sm          // font-size: 14px
text-lg          // font-size: 18px
text-3xl         // font-size: 30px
text-6xl         // font-size: 60px
line-clamp-2     // Truncate to 2 lines
truncate         // Truncate single line
```

### Sizing
```
h-10 w-10        // height: 40px, width: 40px
h-6 w-6          // height: 24px, width: 24px
size-4           // width & height: 16px
min-h-screen     // min-height: 100vh
```

### Visibility
```
opacity-50       // opacity: 50%
opacity-0        // opacity: 0% (invisible)
invisible        // visibility: hidden
```

### Transitions
```
transition       // Default transitions
transition-all   // All properties
duration-300     // 300ms duration
ease-in-out      // Timing function
```

---

## Responsive Prefixes

```
sm:     // 640px+
md:     // 768px+
lg:     // 1024px+
xl:     // 1280px+
2xl:    // 1536px+

Example:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* 1 col mobile, 2 cols tablet, 4 cols desktop */}
</div>
```

---

## Dark Mode

### All pages are dark theme
```tsx
<html className="dark">
  <body className="bg-slate-950 text-slate-100">
    {/* Content */}
  </body>
</html>
```

### No light mode toggle needed (for MVP)

### To add in future:
```tsx
import { useTheme } from "next-themes"

const { theme, setTheme } = useTheme()
setTheme(theme === 'dark' ? 'light' : 'dark')
```

---

## Common Mistakes to Avoid

### ❌ Don't Do This
```tsx
// Inline hex colors
<div className="text-red-500"> {/* Red instead of error variant */}

// Magic numbers
<div className="p-[23px]"> {/* Use standard spacing */}

// Missing responsive prefixes
<div className="grid grid-cols-4"> {/* Not mobile-friendly */}

// Over-nesting groups
<div className="group">
  <div className="group/inner"> {/* Confusing */}
    
// Inconsistent spacing
<div className="gap-2 md:gap-8 lg:gap-4"> {/* Jump around */}
```

### ✅ Do This Instead
```tsx
// Use semantic classes
<div className="text-destructive">

// Standard spacing
<div className="p-4 md:p-6 lg:p-8">

// Mobile-first responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// Clear group hierarchy
<div className="group">
  <Icon className="group-hover:scale-110">

// Consistent increments
<div className="gap-4 md:gap-6 lg:gap-8">
```

---

## Performance Tips

1. **Use Next.js Image component**
   ```tsx
   import Image from "next/image"
   <Image src="/image.jpg" alt="..." width={400} height={400} />
   ```

2. **Lazy load heavy sections**
   ```tsx
   import dynamic from "next/dynamic"
   const TrendingSection = dynamic(() => import("@/components/home/trending-section"))
   ```

3. **Memoize expensive components**
   ```tsx
   const DashboardSection = memo(({ orders }) => ...)
   ```

4. **Don't add animations to every element**
   - Use `transition` only where needed
   - Avoid `animate-pulse` on production
   - Prefer `group-hover` over individual states

---

## Testing Checklist

- [ ] Mobile (375px, 768px)
- [ ] Tablet (768px, 1024px)
- [ ] Desktop (1280px+)
- [ ] Dark theme rendering
- [ ] All buttons clickable
- [ ] Forms submittable
- [ ] Auth flow working
- [ ] Real-time updates syncing
- [ ] No console errors/warnings
- [ ] Links all functional

---

## Deployment Commands

```bash
# Test locally
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint check
npm run lint
```

---

## File Structure for Future Components

When adding new sections, follow this pattern:

```tsx
// components/section-name.tsx
"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SectionNameProps {
  title: string
  description?: string
}

export function SectionName({ title, description }: SectionNameProps) {
  return (
    <section className="py-20 md:py-32 border-b border-slate-800/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-slate-400">{description}</p>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            {/* Item */}
          </Card>
        </div>
      </div>
    </section>
  )
}
```

---

## Common Issues & Solutions

### Issue: Build failing
**Solution:** Run `npm run build` locally first, check console errors

### Issue: Styles not applying
**Solution:** 
- Check if class is spelled correctly
- Verify responsive prefix (sm:, md:, lg:)
- Check if element is child of correct parent

### Issue: Responsive not working
**Solution:**
- Add breakpoints: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Test at actual breakpoint widths
- Check browser dev tools responsive mode

### Issue: Animation choppy
**Solution:**
- Use `duration-300` or `duration-500`
- Avoid animating too many elements
- Test on slower devices

---

## Resources

- **Tailwind CSS:** https://tailwindcss.com/docs
- **Radix UI:** https://www.radix-ui.com/
- **Next.js:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs

---

**Last Updated:** January 16, 2026  
**Version:** 1.0  
**Status:** Production Ready ✅

# 🔐 Complete Authentication System Explanation

## THE PROBLEM EXPLAINED

### Why Magic Link Redirects Back to Login

```
User Flow:
1. User clicks "Send Magic Link" ✅ Works
2. Email is sent ✅ Works
3. User clicks link in email ✅ Works
4. Callback route runs ✅ Works
5. Code is exchanged for session ✅ Works (sometimes)
6. Cookies are set ✅ Works (in response)
7. BUT... Browser doesn't have the session cookie yet ❌ PROBLEM
8. Auth provider runs on page load
9. Checks for session: getSession() → returns nothing (cookie not ready)
10. No session found → user = null
11. Middleware/Auth checks → user is null → redirect to login
```

### The Root Cause

The issue was using `getSession()` instead of `getUser()`:

```typescript
// OLD (WRONG) ❌
const { data: { session }, error } = await supabase.auth.getSession()
// Returns session from memory ONLY (not from cookies)
// On fresh page load → always null

// NEW (CORRECT) ✅  
const { data: { user }, error } = await supabase.auth.getUser()
// Reads session from auth.currentUser or cookies
// Works even on fresh page load
```

### Why User Deletion Didn't Work

```typescript
// OLD (WRONG) ❌
const supabase = createServerClient(
  url, key, { cookies: {...} }
)
await supabase.auth.admin.deleteUser(userId)

// createServerClient with service role + cookie management
// = Service role key gets confused with cookie auth
// = admin methods don't work properly

// NEW (CORRECT) ✅
const supabaseAdmin = createClient(
  url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } }
)
await supabaseAdmin.auth.admin.deleteUser(userId)

// createClient with pure service role (no cookies)
// = Admin methods work properly
// = User gets deleted successfully
```

---

## HOW THE AUTHENTICATION FLOW WORKS NOW

### 1️⃣ Magic Link Request (Client-Side)

**File:** `app/auth/login/page.tsx`

```typescript
const supabase = createClient() // Uses PKCE flow

await supabase.auth.signInWithOtp({
  email: userEmail,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    shouldCreateUser: true
  }
})
```

**What happens:**
1. Client generates PKCE code verifier (random string)
2. Stores verifier in memory (IndexedDB)
3. Sends OTP request to Supabase
4. Supabase sends magic link: `...?code=ABC123&token_hash=XYZ456`
5. Email is sent to user ✅

**Why PKCE matters:**
- PKCE = Proof Key for Code Exchange
- Client creates random verifier → Server verifies code was requested by same client
- Security: Prevents token interception
- Requirement: Supabase OTP REQUIRES PKCE (can't be disabled)

---

### 2️⃣ Magic Link Click (Email → Redirect)

**What the user does:**
1. User receives email
2. Clicks magic link with `code` and `token_hash` in URL
3. Browser navigates to `https://app.com/auth/callback?code=ABC&token_hash=XYZ`

---

### 3️⃣ Callback Handler (Server-Side)

**File:** `app/auth/callback/route.ts`

```typescript
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  // URL = "...?code=ABC&token_hash=XYZ&code_challenge_method=s256"
  
  const supabase = createServerClient(
    url, anonKey,
    { cookies: { ... } } // Cookie jar for setting session
  )
  
  // This does the magic:
  const { data, error } = await supabase.auth.exchangeCodeForSession(
    requestUrl.toString() // Full URL with code + token_hash
  )
  // Supabase receives: code, token_hash, PKCE code verifier (from IndexedDB)
  // Validates: code matches token_hash, code was issued by same client
  // Returns: session object with JWT tokens
  // Cookies are set automatically via the cookie handler
}
```

**What happens:**
1. Server receives callback URL with `code` and `token_hash`
2. Server sends to Supabase: code + token_hash + original code challenge
3. Supabase verifies the PKCE chain (code verifier matches code challenge)
4. Supabase returns: `{ session: { ... }, user: { ... } }`
5. Server sets cookie: `sb-access-token`, `sb-refresh-token` (via `cookieStore.set()`)
6. Server redirects to `/shops`

**Why this works:**
- Cookie is set in server response headers
- Browser receives cookie in response
- Browser stores cookie
- Browser automatically sends cookie in next requests
- Session persists ✅

---

### 4️⃣ Auth Provider Initialization (Client-Side)

**File:** `components/auth/auth-provider.tsx`

```typescript
// On app load:
const loadSession = async () => {
  // CRITICAL FIX: Use getUser() not getSession()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (user) {
    // User found! Set auth state
    setUser(user)
    setLoading(false)
  } else {
    // No session
    setUser(null)
  }
}

useEffect(() => {
  loadSession() // Called on app mount
  
  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user) // User logged in
      }
      if (event === 'SIGNED_OUT') {
        setUser(null) // User logged out
      }
    }
  )
}, [])
```

**Timeline:**
```
T0: User lands on /shops after magic link click
T1: Browser includes auth cookies in request
T2: Layout component renders → AuthProvider initializes
T3: loadSession() calls getUser()
T4: getUser() reads cookies from browser
T5: Supabase verifies JWT in cookie (still valid)
T6: Returns: { user: {...}, error: null }
T7: setUser(user) ✅
T8: Header shows user profile menu ✅
T9: Page is now authenticated
```

**Why `getUser()` works:**
- Reads session from `auth.currentUser` or validates JWT from cookie
- Works on initial page load (doesn't require session from memory)
- Works in server components (reads cookie)
- Works in client components (reads from auth state)

---

## FILE-BY-FILE BREAKDOWN

### `lib/supabase/client.ts` ✅

```typescript
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,        // Save session to localStorage
        autoRefreshToken: true,      // Auto-refresh expired tokens
        detectSessionInUrl: true,    // Look for session in URL params
        flowType: 'pkce'             // Use PKCE (REQUIRED for OTP)
      }
    }
  )
}
```

**Why each setting:**
- `persistSession: true` → Session survives page refresh
- `autoRefreshToken: true` → User stays logged in without re-authenticating
- `detectSessionInUrl: true` → Handles deeplinks with session
- `flowType: 'pkce'` → **CRITICAL** - Required for magic link OTP flow

---

### `app/auth/callback/route.ts` ✅

```typescript
export const dynamic = 'force-dynamic' // Don't cache this route

export async function GET(request: NextRequest) {
  // Cookie jar for setting session cookies
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    url, anonKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options) // Set auth cookies
          )
        }
      }
    }
  )
  
  // Exchange code + token_hash for session
  // Supabase validates PKCE code verifier internally
  const { data, error } = await supabase.auth.exchangeCodeForSession(
    requestUrl.toString() // Pass full URL with code & token_hash
  )
  
  if (error || !data.session) {
    return NextResponse.redirect(
      new URL("/auth/login?error=...", origin)
    )
  }
  
  // Redirect to authenticated page
  // At this point: cookies are set ✅
  return NextResponse.redirect(new URL("/shops", origin))
}
```

**Key points:**
- Uses `createServerClient` with anon key (not service role)
- Passes full URL to `exchangeCodeForSession()` (includes code + token_hash)
- Cookies are set before redirect
- No error = session was successfully created

---

### `app/auth/login/page.tsx` ✅

```typescript
"use client" // Client component

export default function LoginPage() {
  const handleSendMagicLink = async (e: React.FormEvent) => {
    const supabase = createClient() // Automatically generates PKCE verifier
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: userEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true // Create user if doesn't exist
      }
    })
    
    if (error) {
      setError(error.message)
      return
    }
    
    // Email sent, show success message
    setSent(true)
  }
}
```

**What happens:**
1. `createClient()` initializes Supabase with PKCE
2. PKCE verifier is generated and stored locally (IndexedDB)
3. `signInWithOtp()` sends OTP request with code challenge
4. Supabase sends magic link email
5. When user clicks link: callback receives code + token_hash
6. PKCE verifier is used to complete exchange

---

### `components/auth/auth-provider.tsx` ✅

```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  
  const loadSession = async () => {
    // CRITICAL: Use getUser() not getSession()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (user) {
      const formattedUser = await formatUser(user)
      setUser(formattedUser)
    } else {
      setUser(null)
    }
    setLoading(false)
  }
  
  useEffect(() => {
    loadSession() // Load session on mount
    
    // Listen for auth changes (magic link, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const formatted = await formatUser(session.user)
          setUser(formatted) // User just logged in
        } else if (event === 'SIGNED_OUT') {
          setUser(null) // User logged out
        }
        setLoading(false)
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  return (
    <AuthContext.Provider value={{ user, loading, ... }}>
      {children}
    </AuthContext.Provider>
  )
}
```

**Why `getUser()` is critical:**
```typescript
// OLD: getSession() ❌
const { session } = await supabase.auth.getSession()
// Returns session from memory ONLY
// On page reload → memory is empty → session = null
// User seems logged out even though cookie exists

// NEW: getUser() ✅
const { user } = await supabase.auth.getUser()
// Returns user from cookie if valid
// On page reload → reads cookie → user = data
// Session persists across page reloads
```

---

### `app/api/admin/users/[id]/delete/route.ts` ✅

```typescript
import { createClient } from '@supabase/supabase-js' // NOT SSR version

export async function DELETE(request, { params }) {
  const userId = params.id
  
  // Create admin client with service role key
  // CRITICAL: Use createClient (not createServerClient)
  const supabaseAdmin = createClient(
    url,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // Admin key (server-only!)
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  )
  
  // Use admin method to delete user
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  
  if (error) return NextResponse.json({ error: error.message }, 500)
  
  return NextResponse.json({ success: true })
}
```

**Why `createClient` and not `createServerClient`:**
```
createServerClient + service role key 
= Tries to manage both service auth AND user session cookies
= Gets confused about which auth context to use
= Admin methods don't work properly

createClient + service role key
= Pure admin client (no cookie management)
= Admin methods work correctly
= Service role key is never exposed to client
```

**Why service role key is safe here:**
- Only used in API route (server-only)
- Never sent to client
- Protected by API rate limiting
- Deleted users are removed from auth completely

---

## ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                       USER BROWSER                           │
│                                                               │
│  1. User clicks "Send Magic Link"                           │
│     ↓                                                         │
│  2. createClient() initializes PKCE                         │
│     ↓                                                         │
│  3. signInWithOtp() sends email                             │
│     ↓                                                         │
│  4. User receives email, clicks link                        │
│     ↓                                                         │
│  5. Browser navigates: /auth/callback?code=X&token_hash=Y  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER                            │
│                                                               │
│  /auth/callback GET handler:                                │
│  - Receives URL with code + token_hash                      │
│  - Creates Supabase client with SSR cookies                 │
│  - Calls exchangeCodeForSession(fullUrl)                    │
│  - Supabase validates PKCE + code + token_hash             │
│  - Returns session object                                    │
│  - Cookies are set in response                              │
│  - Redirect to /shops                                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
        BROWSER RECEIVES RESPONSE WITH COOKIES
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              BROWSER (After Redirect)                        │
│                                                               │
│  1. Navigation to /shops                                     │
│     ↓                                                         │
│  2. AuthProvider mounts                                      │
│     ↓                                                         │
│  3. loadSession() → calls getUser()                         │
│     ↓                                                         │
│  4. getUser() reads auth cookie                             │
│     ↓                                                         │
│  5. Returns: { user: {...}, error: null }                   │
│     ↓                                                         │
│  6. setUser(user) ✅ UPDATE AUTH CONTEXT                    │
│     ↓                                                         │
│  7. Profile menu shows user email ✅                         │
│     ↓                                                         │
│  8. Page refresh? Cookie still exists → stays logged in ✅  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## COMMON ISSUES & SOLUTIONS

### Issue: "Redirect back to login"

**Root cause:** `getSession()` used instead of `getUser()`
**Solution:** Already applied in this fix
**Check:** `components/auth/auth-provider.tsx` line 109

### Issue: "Session not found" console error

**Root cause:** Auth state changes not triggering properly
**Solution:** Ensure `onAuthStateChange` subscription is active
**Check:** Browser console should show "Auth state changed: SIGNED_IN" after magic link click

### Issue: "User deletion not working"

**Root cause:** `createServerClient` used with service role
**Solution:** Changed to `createClient` with service role
**Check:** `app/api/admin/users/[id]/delete/route.ts`

### Issue: "PKCE code verifier missing"

**Root cause:** Using OTP without PKCE enabled
**Solution:** Set `flowType: 'pkce'` in client config
**Check:** `lib/supabase/client.ts`

---

## ENVIRONMENT VARIABLES NEEDED

```
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  ← For user deletion API
```

All three are required for full functionality.

---

## DEPLOYMENT CHECKLIST

- [ ] All three fixes applied and pushed
- [ ] GitHub Actions passes (all jobs green)
- [ ] Vercel deployment shows "Ready"
- [ ] Environment variables set in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL` ✓
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
  - `SUPABASE_SERVICE_ROLE_KEY` ✓
- [ ] Magic link email sending works
- [ ] Callback redirects successfully
- [ ] Session persists after magic link
- [ ] Profile menu shows user email
- [ ] Page refresh maintains session
- [ ] User deletion API works

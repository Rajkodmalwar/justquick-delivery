# Profile Save Bug - Complete Fix

## Problem Summary
Users were getting stuck on "Saving..." when trying to update their profile with name, phone, and address. The button never completed and profile data wasn't saved.

**Root Causes Found:**
1. ❌ `profiles` table was missing `name`, `phone`, `address`, `email` columns
2. ❌ No RLS (Row Level Security) policies configured for the `profiles` table
3. ❌ `handleSetBuyer()` was using `buyerData.id` instead of authenticated user's `session.user.id`
4. ❌ Insufficient error logging to show what was failing
5. ❌ Loading state not always reset properly on errors

---

## Solution Implemented

### 1. **Database Migration** ✅
**File:** `scripts/sql/add_buyer_profile_v7.sql`

This migration adds:
- ✅ Missing columns: `name`, `phone`, `address`, `email`, `updated_at`
- ✅ RLS policies for authenticated users to read/update own profile
- ✅ Auto-timestamp trigger for `updated_at`
- ✅ Auto-profile creation trigger when new user signs up

**What it does:**
```sql
-- Adds required columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

-- Enables RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Creates RLS policies
CREATE POLICY "Buyers can read own profile" ON profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Buyers can update own profile" ON profiles  
FOR UPDATE TO authenticated USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### 2. **Fixed Cart Context** ✅
**File:** `components/buyer/cart-context.tsx`

**Key improvements in `handleSetBuyer()`:**
```typescript
// ❌ BEFORE: Used wrong user ID
const { error: profileError } = await supabase
  .from('profiles')
  .upsert({
    id: buyerData.id,  // ← WRONG! Could be empty string
    ...
  })

// ✅ AFTER: Uses authenticated user's actual session ID
const userId = session.user.id  // ← Correct user from auth
const { data: updateResult, error: profileError } = await supabase
  .from('profiles')
  .update({
    name: buyerData.name,
    phone: buyerData.phone,
    address: buyerData.address,
    email: buyerData.email,
    updated_at: new Date().toISOString()
  })
  .eq('id', userId)  // ← Matches authenticated user
  .select('*')
  .single()
```

**Error handling improvements:**
- ✅ Detailed logging at every step
- ✅ Distinguishes between auth errors, DB errors, RLS errors
- ✅ Returns clear error messages to show in UI
- ✅ Provides helpful error codes (PGRST116, 42P01)

### 3. **Fixed Profile Page** ✅
**File:** `app/profile/page.tsx`

**Key improvements in `handleSave()`:**
```typescript
// ✅ Better logging at each step
logger.log("📝 Profile: Starting save operation...")
logger.log("📝 Profile: Calling setBuyer() to update Supabase...")
logger.log("✅ Profile: Profile saved to Supabase successfully")
logger.log("🔄 Profile: Calling refreshUser() to sync database data...")
logger.log("✅ Profile: Buyer state refreshed from database")

// ✅ Always reset loading state, even on error
try {
  // ... save logic ...
} catch (err) {
  setError(err.message)
} finally {
  setSaving(false)  // ← CRITICAL: Always reset
}

// ✅ Clear success before next attempt
setSuccess(false)
```

---

## What You MUST Do Now

### Step 1: Run Migration on Supabase ⚡ **CRITICAL**
Go to **Supabase Dashboard** → Your Project → **SQL Editor**

Copy and paste the entire content of:
```
scripts/sql/add_buyer_profile_v7.sql
```

Click **Execute** and wait for success.

**What this does:**
- Adds missing `name`, `phone`, `address` columns to `profiles` table
- Enables RLS security
- Creates user access policies
- Sets up auto-profile creation for new signups

### Step 2: Create Missing Profiles (For Existing Users)
If you have existing users, run this in Supabase SQL Editor:

```sql
INSERT INTO public.profiles (id, role, created_at)
SELECT id, 'buyer', now()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;
```

This creates profile records for users who signed up before the migration.

### Step 3: Commit Code Changes
```bash
cd f:\hyperlocaldeliverymvp2
git add -A
git commit -m "Fix: Profile save infinite load - add DB columns, RLS, better error handling

- Add missing columns to profiles table via migration
- Fix handleSetBuyer to use session.user.id not buyerData.id
- Add RLS policies for profile access control
- Improve error logging and messages
- Ensure loading state always resets
- Handle all Supabase error codes properly"
git push origin main
```

### Step 4: Redeploy on Vercel
1. Go to **Vercel Dashboard** → Your Project
2. The new commit should trigger auto-deployment
3. Wait for "Ready" status
4. Then test the profile save

---

## Testing the Fix

### Local Development Test
1. Run `npm run dev`
2. Login with magic link
3. Go to `/profile`
4. Fill in name, phone (10 digits starting with 6-9), address
5. Click **Save**
6. Should see success message and redirect back
7. Check **Supabase → profiles table** - data should be saved

### Production Test (https://justquick.tech)
1. Visit https://justquick.tech
2. Login
3. Try checkout and complete profile
4. Should save without infinite "Saving..." state
5. Check Supabase profiles table for your data

---

## Expected Behavior After Fix

### Success Case ✅
```
User clicks Save
↓
✅ setBuyer() validates user is authenticated
↓
✅ Gets session.user.id (correct user ID)
↓
✅ Updates profiles table using RLS policy
↓
✅ refreshUser() fetches updated data from DB
↓
✅ Shows "Profile Updated!" success message
↓
✅ Redirects back to checkout
```

### Error Case (Now with Clear Message) 🔴
If something fails:
```
User clicks Save
↓
❌ Error occurs (RLS denied, DB error, etc.)
↓
✅ Error caught and logged with details
✅ Clear error message shown to user
✅ "Saving..." button returns to normal
✅ User can try again or see what went wrong
```

---

## Debugging Commands

If you need to verify the migration was successful:

### Check Table Structure
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;
```

Should show: `id`, `role`, `vendor_shop_id`, `delivery_boy_id`, `created_at`, **`name`**, **`email`**, **`phone`**, **`address`**, **`updated_at`**

### Check RLS Status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';
```

Should show: `rowsecurity = true`

### Check RLS Policies
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';
```

Should show 3-4 policies:
- "Buyers can read own profile"
- "Buyers can update own profile"
- "Users can create their own profile"

### Check Your Profile Data
```sql
SELECT * FROM profiles 
WHERE id = '[your-user-id]';
```

Should show your `name`, `phone`, `address` after saving.

---

## Common Issues After Fix

### "No profile found" Error
**Cause:** User doesn't have a profile record
**Fix:** Run the existing users migration script above

### "RLS policy denied" Error  
**Cause:** RLS policy not created correctly
**Fix:** Re-run the migration to recreate policies

### "Column doesn't exist" Error
**Cause:** Migration didn't run properly
**Fix:** Go to Supabase SQL Editor and manually run migration again

### Still getting "Saving..." stuck
**Cause:** Old code cached in browser
**Fix:** Clear browser cache or do hard refresh (Ctrl+Shift+R)

---

## Files Modified
1. ✅ `scripts/sql/add_buyer_profile_v7.sql` - **NEW** migration file
2. ✅ `components/buyer/cart-context.tsx` - Fixed `handleSetBuyer()` 
3. ✅ `app/profile/page.tsx` - Better error handling in `handleSave()`

## Production Verification Checklist
- [ ] Migration run successfully on Supabase
- [ ] Existing users profiles created (if needed)
- [ ] Code changes committed and pushed
- [ ] Vercel redeployed (auto-triggered)
- [ ] Tested profile save locally (localhost:3000)
- [ ] Tested profile save in production (https://justquick.tech)
- [ ] Verified data in Supabase profiles table
- [ ] Error messages display correctly when something fails

---

**After completing these steps, profile saves should work perfectly!** 🚀

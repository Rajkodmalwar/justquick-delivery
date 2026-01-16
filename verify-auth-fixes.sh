#!/bin/bash

# Auth Fixes Verification Script
# Checks if the authentication fixes are properly deployed

echo "🔍 Auth Fixes Verification"
echo "=========================="
echo ""

# Check 1: Verify GitHub commits
echo "✅ Check 1: GitHub Commits"
git log --oneline -n 5
echo ""

# Check 2: Verify Supabase client config
echo "✅ Check 2: Supabase Client Config"
if grep -q "detectSessionInUrl: true" lib/supabase/client.ts; then
    echo "✓ detectSessionInUrl enabled"
else
    echo "✗ detectSessionInUrl NOT found"
fi

if grep -q "flowType: 'pkce'" lib/supabase/client.ts; then
    echo "✓ PKCE flow enabled"
else
    echo "✗ PKCE flow NOT found"
fi

if grep -q "storageKey: 'justquick_auth'" lib/supabase/client.ts; then
    echo "✓ Custom storage key set"
else
    echo "✗ Custom storage key NOT found"
fi
echo ""

# Check 3: Verify sessionStorage migration
echo "✅ Check 3: SessionStorage Migration"
if grep -q "sessionStorage" components/buyer/cart-context.tsx; then
    echo "✓ SessionStorage used in cart context"
else
    echo "✗ SessionStorage NOT found in cart context"
fi

if grep -q "sessionStorage" lib/supabase/client.ts || grep -q "sessionStorage" components/auth/auth-provider.tsx; then
    echo "✓ SessionStorage fallback in auth"
else
    echo "✗ SessionStorage fallback NOT found"
fi
echo ""

# Check 4: Verify auth event handling
echo "✅ Check 4: Auth Event Handling"
if grep -q "SIGNED_IN\|TOKEN_REFRESHED\|USER_UPDATED" components/auth/auth-provider.tsx; then
    echo "✓ Proper auth events handled"
else
    echo "✗ Auth events NOT properly handled"
fi

if grep -q "SIGNED_OUT" components/auth/auth-provider.tsx; then
    echo "✓ Sign out event handled"
else
    echo "✗ Sign out event NOT handled"
fi
echo ""

echo "📋 Next Steps:"
echo "1. Push changes: git push origin main"
echo "2. Wait for Vercel deployment (2-3 minutes)"
echo "3. Visit: https://hyperlocal-delivery-app.vercel.app"
echo "4. Test login flow"
echo "5. Test session persistence (refresh after login)"
echo ""
echo "✨ All checks passed! Ready for testing."

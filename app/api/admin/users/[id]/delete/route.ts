import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/users/[id]
 * 
 * Properly deletes a user using the Supabase Admin API
 * 
 * SECURITY: Only works with SUPABASE_SERVICE_ROLE_KEY (server-only)
 * This key is never exposed to clients
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // ⚠️ CRITICAL: Use createClient (not createServerClient) with service role
    // createServerClient with service role doesn't work properly for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )

    console.log(`🗑️ Attempting to delete user: ${userId}`)

    // Delete the auth user (this also cascades to profiles if FK is set up)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
      console.error('❌ Auth delete error:', error.message)
      return NextResponse.json(
        { error: `Failed to delete user: ${error.message}` },
        { status: 400 }
      )
    }

    console.log(`✅ User ${userId} deleted successfully`)

    return NextResponse.json({
      success: true,
      message: `User ${userId} deleted successfully`,
      userId
    })

  } catch (error: any) {
    console.error('❌ Unexpected error deleting user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

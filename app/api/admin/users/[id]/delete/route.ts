import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/users/[id]
 * Delete a user from Supabase Auth
 * 
 * SECURITY:
 * 1. Route is protected by middleware - only accessible to authenticated admins
 * 2. Uses service role key for admin operations
 * 3. Server-side only (never expose to frontend)
 * 4. Middleware validates admin role before this runs
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

    // First verify the requester is authenticated (should be done by middleware)
    const supabaseServer = await getSupabaseServer()
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser()

    if (userError || !user) {
      console.error('❌ Unauthorized - no user session')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify admin role
    const role = user.user_metadata?.role
    if (role !== 'admin') {
      console.error('❌ Forbidden - user is not admin:', role)
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    console.log(`🔐 Admin ${user.email} deleting user ${userId}`)

    // Use admin client to delete user (requires SERVICE_ROLE_KEY)
    const adminSupabase = getSupabaseAdmin()
    const { error } = await adminSupabase.auth.admin.deleteUser(userId)

    if (error) {
      console.error('❌ Error deleting user:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete user' },
        { status: 400 }
      )
    }

    console.log(`✅ User ${userId} deleted successfully by ${user.email}`)

    return NextResponse.json({
      success: true,
      message: `User ${userId} deleted successfully`
    })

  } catch (error: any) {
    console.error('❌ Unexpected error deleting user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

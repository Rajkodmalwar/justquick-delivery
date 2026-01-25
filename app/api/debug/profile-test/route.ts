import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export const dynamic = 'force-dynamic'

/**
 * DEBUG ENDPOINT: Test profile save in production
 * 
 * This helps diagnose:
 * - Session authentication issues
 * - RLS policy violations
 * - Database connectivity
 * 
 * Usage: POST /api/debug/profile-test
 */
export async function POST(req: Request) {
  const cookieStore = await cookies()

  // Create Supabase server client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  try {
    // Step 1: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      return NextResponse.json(
        {
          status: "error",
          step: "authentication",
          message: "Failed to get user",
          error: authError.message,
        },
        { status: 401 }
      )
    }

    if (!user) {
      return NextResponse.json(
        {
          status: "error",
          step: "authentication",
          message: "No authenticated user found",
        },
        { status: 401 }
      )
    }

    // Step 2: Try to read existing profile
    const { data: profile, error: readError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (readError && readError.code !== "PGRST116") {
      // PGRST116 means no rows found, which is OK
      return NextResponse.json(
        {
          status: "error",
          step: "read_profile",
          message: "Failed to read profile",
          error: readError.message,
          code: readError.code,
        },
        { status: 500 }
      )
    }

    // Step 3: Try to upsert a test profile
    const testData = {
      id: user.id,
      name: "Test Name",
      phone: "9999999999",
      address: "Test Address",
      updated_at: new Date().toISOString(),
    }

    const { error: upsertError, status, statusText } = await supabase
      .from("profiles")
      .upsert(testData, { onConflict: "id" })

    if (upsertError) {
      return NextResponse.json(
        {
          status: "error",
          step: "upsert_profile",
          message: "Failed to upsert profile",
          error: upsertError.message,
          code: upsertError.code,
          details: upsertError.details,
          hint: upsertError.hint,
          httpStatus: status,
          httpStatusText: statusText,
        },
        { status: 500 }
      )
    }

    // Step 4: Verify the update worked
    const { data: updatedProfile, error: verifyError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (verifyError) {
      return NextResponse.json(
        {
          status: "error",
          step: "verify_profile",
          message: "Failed to verify profile after update",
          error: verifyError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Profile test completed successfully",
        user: {
          id: user.id,
          email: user.email,
        },
        previousProfile: profile,
        updatedProfile: updatedProfile,
      },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Unexpected error",
        error: error.message,
      },
      { status: 500 }
    )
  }
}

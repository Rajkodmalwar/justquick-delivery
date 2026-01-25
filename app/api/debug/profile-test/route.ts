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
  try {
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

    const steps: Array<{ step: string; status: string; message?: string; error?: string; data?: any }> = []

    // Step 1: Check authentication
    steps.push({ step: "auth_init", status: "started", message: "Initializing Supabase client..." })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      steps.push({ 
        step: "auth_check", 
        status: "error", 
        message: "Failed to get user",
        error: authError.message 
      })
      return NextResponse.json({ steps }, { status: 401 })
    }

    if (!user) {
      steps.push({ 
        step: "auth_check", 
        status: "error", 
        message: "No authenticated user found"
      })
      return NextResponse.json({ steps }, { status: 401 })
    }

    steps.push({ 
      step: "auth_check", 
      status: "success", 
      message: `Authenticated as ${user.email}`,
      data: { user_id: user.id, email: user.email }
    })

    // Step 2: Try to read existing profile
    steps.push({ step: "profile_read", status: "started", message: "Reading existing profile..." })
    
    const { data: profile, error: readError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (readError && readError.code !== "PGRST116") {
      // PGRST116 means no rows found, which is OK
      steps.push({ 
        step: "profile_read", 
        status: "error", 
        message: "Failed to read profile",
        error: readError.message,
        data: { code: readError.code }
      })
      return NextResponse.json({ steps }, { status: 500 })
    }

    if (readError && readError.code === "PGRST116") {
      steps.push({ 
        step: "profile_read", 
        status: "info", 
        message: "No existing profile found (this is OK)"
      })
    } else if (profile) {
      steps.push({ 
        step: "profile_read", 
        status: "success", 
        message: "Existing profile found",
        data: profile
      })
    }

    // Step 3: Try to upsert a test profile
    steps.push({ step: "profile_upsert", status: "started", message: "Upserting test profile..." })
    
    const testData = {
      id: user.id,
      name: "Test Name",
      phone: "9999999999",
      address: "Test Address",
      updated_at: new Date().toISOString(),
    }

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(testData, { onConflict: "id" })

    if (upsertError) {
      steps.push({ 
        step: "profile_upsert", 
        status: "error", 
        message: "Failed to upsert profile",
        error: upsertError.message,
        data: { 
          code: upsertError.code,
          details: upsertError.details,
          hint: upsertError.hint
        }
      })
      return NextResponse.json({ steps }, { status: 500 })
    }

    steps.push({ 
      step: "profile_upsert", 
      status: "success", 
      message: "Profile upserted successfully"
    })

    // Step 4: Verify the update worked
    steps.push({ step: "profile_verify", status: "started", message: "Verifying profile after update..." })
    
    const { data: updatedProfile, error: verifyError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (verifyError) {
      steps.push({ 
        step: "profile_verify", 
        status: "error", 
        message: "Failed to verify profile after update",
        error: verifyError.message
      })
      return NextResponse.json({ steps }, { status: 500 })
    }

    steps.push({ 
      step: "profile_verify", 
      status: "success", 
      message: "Profile verified successfully",
      data: updatedProfile
    })

    // All steps passed
    return NextResponse.json({
      status: "success",
      message: "All tests passed!",
      steps,
      user: {
        id: user.id,
        email: user.email,
      },
      finalProfile: updatedProfile
    }, { status: 200 })

  } catch (error: any) {
    console.error("DEBUG ENDPOINT ERROR:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Unexpected error in debug endpoint",
        error: error?.message || String(error),
        stack: error?.stack
      },
      { status: 500 }
    )
  }
}

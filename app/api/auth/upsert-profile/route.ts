import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export const dynamic = 'force-dynamic'

const ADMIN_ALLOWED = (process.env.NEXT_PUBLIC_ADMIN_ALLOWED || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

export async function POST(req: Request) {
  // Get cookies for proper authentication in production
  const cookieStore = await cookies()

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

  // Get authenticated user from session
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const role = body?.role as "admin" | "vendor" | "delivery" | undefined
  
  if (!role) {
    return NextResponse.json({ error: "Missing role" }, { status: 400 })
  }

  if (role === "admin") {
    const id = user.email || user.phone || ""
    if (!ADMIN_ALLOWED.includes(id)) {
      return NextResponse.json({ error: "Not authorized as admin" }, { status: 403 })
    }
  }

  const profile = {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role,
    name: user.user_metadata?.name || null,
    shop_id: body?.shop_id || null,
    commission: body?.commission || null,
    last_login: new Date().toISOString(),
  }

  const { error } = await supabase.from("profiles").upsert(profile, { onConflict: "id" })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

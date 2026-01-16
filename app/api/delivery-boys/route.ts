import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"
import { generateLoginCode } from "@/lib/utils/generate-code"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const loginCode = searchParams.get("login_code")
  const availableOnly = searchParams.get("available") === "true"
  const supabase = await getSupabaseServer()

  if (loginCode) {
    const { data, error } = await supabase.from("delivery_boys").select("*").eq("login_code", loginCode).single()
    if (error) return NextResponse.json({ error: "Delivery boy not found" }, { status: 404 })
    return NextResponse.json({ delivery_boy: data })
  }

  let query = supabase.from("delivery_boys").select("*").order("name")
  if (availableOnly) {
    query = query.eq("is_available", true)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ delivery_boys: data })
}

export async function POST(req: Request) {
  const payload = await req.json()
  const supabase = await getSupabaseServer()

  let loginCode = generateLoginCode()

  // Check for uniqueness and regenerate if needed
  let attempts = 0
  while (attempts < 10) {
    const { data: existing } = await supabase.from("delivery_boys").select("id").eq("login_code", loginCode).single()
    if (!existing) break
    loginCode = generateLoginCode()
    attempts++
  }

  const { data, error } = await supabase
    .from("delivery_boys")
    .insert({
      name: payload.name,
      contact: payload.contact || null,
      total_commission: 0,
      login_code: loginCode,
      is_available: false, // Default to unavailable
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ delivery_boy: data })
}

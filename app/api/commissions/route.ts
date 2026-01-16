import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.from("commissions").select("*").order("paid_status", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ commissions: data })
}

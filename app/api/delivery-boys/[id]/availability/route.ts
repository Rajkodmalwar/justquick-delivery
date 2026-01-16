import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { is_available } = await req.json()
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase.from("delivery_boys").update({ is_available }).eq("id", id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ delivery_boy: data })
}

import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { paid_status } = await req.json()
  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.from("commissions").update({ paid_status }).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ commission: data })
}

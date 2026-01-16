import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Parse the form data from the request
    const formData = await request.formData()
    const file = formData.get("file")
    const folder = (formData.get("folder") as string) || "general"

    // Validate file exists and is a File object
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No valid file provided" }, { status: 400 })
    }

    // Validate file size (500KB max)
    if (file.size > 500 * 1024) {
      return NextResponse.json({ error: "File size must be under 500KB" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: JPG, PNG, WebP, GIF" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg"
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: file.type })

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("images").upload(fileName, blob, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error("Supabase upload error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName)

    return NextResponse.json({ url: urlData.publicUrl, path: data.path })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Upload failed"
    console.error("Upload error:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

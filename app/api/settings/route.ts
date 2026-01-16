import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

// Helper to get supabase client (lazy init)
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // CRITICAL: Use service role key
)

// Helper to transform key-value rows into a single object
const transformSettingsToObject = (rows: any[]) => {
  const result: any = {}
  
  // Default values in case rows are empty
  const defaults = {
    delivery_fee: "30",
    platform_fee: "10",
    auto_assign: "false",
    maintenance_mode: "false",
    email_notifications: "true",
    push_notifications: "true",
    two_factor_auth: "false",
    ip_restriction: "false"
  }
  
  // First, fill with database values
  rows.forEach(row => {
    if (row.key && row.value !== undefined) {
      result[row.key] = row.value
    }
  })
  
  // Then apply defaults for any missing keys
  Object.keys(defaults).forEach(key => {
    if (!(key in result)) {
      result[key] = defaults[key as keyof typeof defaults]
    }
  })
  
  // Convert types for frontend
  Object.keys(result).forEach(key => {
    const value = result[key]
    
    // Convert "true"/"false" strings to booleans
    if (value === "true" || value === "false") {
      result[key] = value === "true"
    }
    // Convert numeric strings to numbers
    else if (key === "delivery_fee" || key === "platform_fee") {
      const num = parseFloat(value)
      result[key] = isNaN(num) ? 0 : num
    }
  })
  
  return result
}

export async function GET(request: NextRequest) {
  try {
    // Get ALL settings as key-value rows using admin client
    const { data: settingsRows, error } = await getSupabaseAdmin()
      .from("settings")
      .select("key, value")
      .order("key", { ascending: true })

    if (error) {
      console.error("Settings fetch error:", error)
      
      // Return defaults if table doesn't exist
      if (error.code === '42P01') {
        const defaultSettings = transformSettingsToObject([])
        return NextResponse.json(defaultSettings, { status: 200 })
      }
      
      // For other errors, try creating the table
      if (error.code === '42501') {
        console.log("Permission denied - attempting to create default settings...")
        
        // Try to create default settings
        try {
          const defaults = [
            { key: "delivery_fee", value: "30" },
            { key: "platform_fee", value: "10" },
            { key: "auto_assign", value: "false" },
            { key: "maintenance_mode", value: "false" },
            { key: "email_notifications", value: "true" },
            { key: "push_notifications", value: "true" },
            { key: "two_factor_auth", value: "false" },
            { key: "ip_restriction", value: "false" }
          ]
          
          // Insert defaults
          const { error: insertError } = await getSupabaseAdmin()
            .from("settings")
            .insert(defaults)
          
          if (insertError) {
            console.error("Failed to create default settings:", insertError)
          }
          
          // Return defaults
          const defaultSettings = transformSettingsToObject([])
          return NextResponse.json(defaultSettings, { status: 200 })
        } catch (createError) {
          console.error("Failed to create defaults:", createError)
        }
      }
      
      // Return defaults on other errors
      const defaultSettings = transformSettingsToObject([])
      return NextResponse.json(defaultSettings, { status: 200 })
    }

    // Transform rows into single object with proper types
    const settingsObject = transformSettingsToObject(settingsRows || [])
    
    return NextResponse.json(settingsObject, { status: 200 })

  } catch (error: any) {
    console.error("Settings API GET error:", error)
    // Return defaults on unexpected error
    const defaultSettings = transformSettingsToObject([])
    return NextResponse.json(defaultSettings, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      )
    }

    // Validate body is an object
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      )
    }

    // Get the first key-value pair (frontend sends { delivery_fee: "30" } etc.)
    const entries = Object.entries(body)
    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No settings provided" },
        { status: 400 }
      )
    }

    const [key, rawValue] = entries[0] // Take first key-value pair
    
    // Validate key
    if (typeof key !== 'string' || !key.trim()) {
      return NextResponse.json(
        { error: "Invalid key" },
        { status: 400 }
      )
    }

    // Convert value to string
    let value: string
    if (typeof rawValue === 'boolean') {
      value = rawValue ? "true" : "false"
    } else if (typeof rawValue === 'number') {
      value = rawValue.toString()
    } else if (typeof rawValue === 'string') {
      value = rawValue
    } else {
      return NextResponse.json(
        { error: "Invalid value type" },
        { status: 400 }
      )
    }

    // Upsert the setting using admin client (bypasses RLS)
    const { data, error: upsertError } = await getSupabaseAdmin()
      .from("settings")
      .upsert(
        { 
          key, 
          value,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'key',
          ignoreDuplicates: false
        }
      )
      .select()

    if (upsertError) {
      console.error("Settings upsert error:", upsertError)
      
      // If it's an RLS error, try to create the setting
      if (upsertError.code === '42501') {
        // Try to insert as new record
        const { error: insertError } = await getSupabaseAdmin()
          .from("settings")
          .insert({ key, value, updated_at: new Date().toISOString() })
        
        if (insertError) {
          console.error("Settings insert error:", insertError)
          return NextResponse.json(
            { error: "Permission denied. Check RLS policies." },
            { status: 500 }
          )
        }
        
        // Insert succeeded
        return NextResponse.json(
          { 
            success: true,
            key,
            value,
            message: "Setting created successfully"
          },
          { status: 200 }
        )
      }
      
      return NextResponse.json(
        { error: upsertError.message || "Failed to update setting" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true,
        key,
        value,
        message: "Setting updated successfully"
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error("Settings API POST error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
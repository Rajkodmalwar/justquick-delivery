"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DiagnosticPage() {
  const router = useRouter()
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const runDiagnostics = async () => {
    setLoading(true)
    setError("")
    const results: any = {
      timestamp: new Date().toISOString(),
      checks: []
    }

    try {
      // Check 1: Authentication
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      results.checks.push({
        name: "Authentication",
        status: authErr ? "error" : user ? "success" : "not-authenticated",
        message: authErr ? authErr.message : user ? `Logged in as ${user.email}` : "Not logged in",
        user_id: user?.id
      })

      if (!user) {
        setDiagnostics(results)
        setLoading(false)
        return
      }

      // Check 2: Profile exists
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      results.checks.push({
        name: "Profile Exists",
        status: profileErr?.code === 'PGRST116' ? "missing" : profileErr ? "error" : "success",
        message: profileErr?.code === 'PGRST116' ? "No profile found for this user" : profileErr ? profileErr.message : "Profile found",
        profile_data: profile
      })

      // Check 3: Profile columns
      if (profile) {
        results.checks.push({
          name: "Profile Columns",
          status: "success",
          columns: {
            id: profile.id ? "✅" : "❌",
            name: profile.name ? "✅" : "⚠️ empty",
            email: profile.email ? "✅" : "⚠️ empty",
            phone: profile.phone ? "✅" : "⚠️ empty",
            address: profile.address ? "✅" : "⚠️ empty",
            role: profile.role ? "✅" : "❌",
            updated_at: profile.updated_at ? "✅" : "❌"
          }
        })
      }

      // Check 4: Try to create/update profile
      const testUpdate = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profile?.name || "Test",
          email: user.email,
          phone: profile?.phone || "1234567890",
          address: profile?.address || "Test Address",
          role: profile?.role || "buyer",
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })

      results.checks.push({
        name: "Profile Update/Upsert",
        status: testUpdate.error ? "error" : "success",
        message: testUpdate.error ? testUpdate.error.message : "Successfully upserted profile"
      })

      setDiagnostics(results)
    } catch (err: any) {
      results.checks.push({
        name: "Unexpected Error",
        status: "error",
        message: err.message
      })
      setDiagnostics(results)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>🔧 Database Diagnostics</CardTitle>
            <Button
              onClick={runDiagnostics}
              disabled={loading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded text-red-800">
                {error}
              </div>
            )}

            {diagnostics ? (
              <div className="space-y-4">
                {diagnostics.checks.map((check: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{check.name}</h3>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        check.status === 'success' ? 'bg-green-100 text-green-800' :
                        check.status === 'error' ? 'bg-red-100 text-red-800' :
                        check.status === 'missing' ? 'bg-yellow-100 text-yellow-800' :
                        check.status === 'not-authenticated' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {check.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{check.message}</p>
                    
                    {check.user_id && (
                      <div className="text-xs bg-gray-50 p-2 rounded font-mono break-all">
                        User ID: {check.user_id}
                      </div>
                    )}
                    
                    {check.profile_data && (
                      <div className="text-xs bg-gray-50 p-2 rounded font-mono overflow-auto max-h-40">
                        <pre>{JSON.stringify(check.profile_data, null, 2)}</pre>
                      </div>
                    )}

                    {check.columns && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(check.columns).map(([key, value]) => (
                          <div key={key} className="text-xs bg-gray-50 p-2 rounded flex justify-between">
                            <span className="font-semibold">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-800">
                  <p><strong>Last checked:</strong> {diagnostics.timestamp}</p>
                  <p className="mt-2 text-xs">If Profile is missing, you need to run the database migration in Supabase.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Running diagnostics...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

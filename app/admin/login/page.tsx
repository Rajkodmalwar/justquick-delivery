"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; // Import from your client utility
import { logger } from "@/lib/logger";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/admin/dashboard";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Memoize supabase client to avoid recreating on every render
  const supabase = useMemo(() => createClient(), []);

  // No need for session check - middleware already handles redirection for logged-in admins

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      logger.log("Attempting login for:", email);
      
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      logger.log("LOGIN RESPONSE - Success:", !!data.session, "Error:", loginError?.message);

      if (loginError) {
        throw new Error(loginError.message || "Login failed");
      }

      if (!data.session) {
        throw new Error("No session created");
      }

      // Authenticated successfully - redirect to admin
      // Middleware will verify admin role and redirect to /admin/login if not authorized
      logger.log("Login successful for:", email, "- redirecting to admin area");
      router.push(returnTo);
      
    } catch (err: any) {
      logger.error("Login error:", err);
      setError(err.message || "Login failed — incorrect email or password");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="p-8 shadow-lg bg-white rounded-lg w-96 max-w-md border">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Portal</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="admin@example.com"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            "Login"
          )}
        </button>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            This area is restricted to authorized administrators only.
          </p>
        </div>
      </form>
    </main>
  );
}
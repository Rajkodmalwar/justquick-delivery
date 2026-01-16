"use client";
import { createClient } from "@supabase/supabase-js";
import { useEffect } from "react";

export default function Logout() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    supabase.auth.signOut().then(() => {
      window.location.href = "/admin/login";
    });
  }, []);

  return <h1>Logging out...</h1>;
}

"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

export const dynamic = 'force-dynamic';

export default function DebugSession() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      logger.log("%cSESSION CHECK ↓↓↓", "color: #00f; font-size:18px;");
      logger.log(res);
      alert("SESSION → " + JSON.stringify(res));
    });
  }, []);

  return (
    <h1 style={{ padding: 40, fontSize: 30 }}>
      Session Debug Running... Check Console + Alert
    </h1>
  );
}

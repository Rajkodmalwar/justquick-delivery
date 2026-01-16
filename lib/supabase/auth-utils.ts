// /lib/supabase/auth-utils.ts
export function isAdmin(user: any): boolean {
  return user?.user_metadata?.role === "admin";
}

export function isAuthenticated(session: any): boolean {
  return !!session?.user;
}
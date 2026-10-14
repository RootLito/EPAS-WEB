import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase instance for Next.js (App Router).
 * Safe to use in Client Components ('use client').
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
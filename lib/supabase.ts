import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase instance for Next.js (App Router).
 * Safe to use in Client Components ('use client').
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null = null;

function getExpoExtra(): { supabaseUrl?: string; supabaseAnonKey?: string } {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Constants = require("expo-constants").default as {
      expoConfig?: { extra?: { supabaseUrl?: string; supabaseAnonKey?: string } };
      manifest?: { extra?: { supabaseUrl?: string; supabaseAnonKey?: string } };
    };
    return Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};
  } catch {
    return {};
  }
}

function getEnv(key: string): string | undefined {
  const extra = getExpoExtra();
  if (key === "VITE_SUPABASE_URL") {
    const fromExtra = extra.supabaseUrl;
    if (fromExtra) return fromExtra;
  }
  if (key === "VITE_SUPABASE_ANON_KEY") {
    const fromExtra = extra.supabaseAnonKey;
    if (fromExtra) return fromExtra;
  }
  if (typeof process !== "undefined" && process.env) {
    const v = process.env[key];
    if (v) return v;
    if (key === "VITE_SUPABASE_URL") return process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (key === "VITE_SUPABASE_ANON_KEY") return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  }
  // Literal import.meta.env.* so Vite inlines values at build time (admin / web).
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (key === "VITE_SUPABASE_URL") {
      const url = import.meta.env.VITE_SUPABASE_URL;
      if (url) return url;
    }
    if (key === "VITE_SUPABASE_ANON_KEY") {
      const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (anon) return anon;
    }
  }
  return undefined;
}

export function createSupabaseClient(): SupabaseClient<Database> | null {
  const url = getEnv("VITE_SUPABASE_URL");
  const anonKey = getEnv("VITE_SUPABASE_ANON_KEY");
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient<Database>(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

export function getSupabase(): SupabaseClient<Database> {
  const c = createSupabaseClient();
  if (!c) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return c;
}

export function isSupabaseReady(): boolean {
  return createSupabaseClient() !== null;
}

export async function getSessionUserId(): Promise<string | null> {
  const sb = createSupabaseClient();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.user?.id ?? null;
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client — the realtime backend that syncs orders live across separate
 * devices (the counter phone and the kitchen screen).
 *
 * Credentials come from Vite env vars in `.env.local` (gitignored):
 *   VITE_SUPABASE_URL=https://<project>.supabase.co
 *   VITE_SUPABASE_ANON_KEY=<anon public key>
 *
 * If they're absent (e.g. before setup, or inside the Tempo canvas sidecar),
 * `supabase` is null and the store falls back to same-device-only sync so the
 * app still runs.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, { realtime: { params: { eventsPerSecond: 10 } } })
  : null;

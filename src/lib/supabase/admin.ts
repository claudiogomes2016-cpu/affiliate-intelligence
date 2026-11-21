import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabasePublicEnv } from "@/lib/env";

/** Thrown when server configuration is wrong. Its message never contains secret values. */
export class ServerConfigError extends Error {}

/**
 * Service-role client: BYPASSES RLS. Only for trusted server jobs (cron, webhooks,
 * postbacks) after their own authentication. Never import from client code.
 */
export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) throw new ServerConfigError("SUPABASE_SERVICE_ROLE_KEY is not set.");
  // A single token: catches two keys pasted together, line breaks, quotes, etc.
  if (!/^[A-Za-z0-9._-]{20,}$/.test(key)) {
    throw new ServerConfigError(
      "SUPABASE_SERVICE_ROLE_KEY is malformed (it must be exactly one key, with no spaces or line breaks).",
    );
  }
  const { url } = supabasePublicEnv();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

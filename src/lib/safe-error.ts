import { ServerConfigError } from "@/lib/supabase/admin";

/**
 * Turns an unexpected exception into a message that is safe to show in the UI.
 * Raw exception text can embed secrets (e.g. header values), so it is logged on
 * the server only.
 */
export function safeErrorMessage(e: unknown, context: string): string {
  if (e instanceof ServerConfigError) return e.message;
  console.error(`[${context}]`, e);
  return "Unexpected server error. Details were written to the server log.";
}

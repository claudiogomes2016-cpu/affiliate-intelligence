import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({ supabasePublicEnv: () => ({ url: "https://example.supabase.co", anonKey: "x".repeat(30) }) }));

import { createSupabaseAdminClient, ServerConfigError } from "./admin";
import { safeErrorMessage } from "../safe-error";
import { checkApiKey } from "@/integrations/clickbank/api";

const KEY_A = "sb_secret_AAAAAAAAAAAAAAAAAAAAAAAA";
const KEY_B = "sb_secret_BBBBBBBBBBBBBBBBBBBBBBBB";

describe("service role key handling", () => {
  afterEach(() => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects two keys pasted together without echoing either", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = `${KEY_A} ${KEY_B}`;
    try {
      createSupabaseAdminClient();
      throw new Error("should fail");
    } catch (e) {
      expect(e).toBeInstanceOf(ServerConfigError);
      const msg = safeErrorMessage(e, "test");
      expect(msg).toMatch(/malformed/);
      expect(msg).not.toContain("sb_secret");
    }
  });

  it("accepts a single key, trimming stray whitespace", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = `  ${KEY_A}\n`;
    expect(() => createSupabaseAdminClient()).not.toThrow();
  });

  it("hides unexpected exception text", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const msg = safeErrorMessage(new TypeError(`Headers.set: "${KEY_A}" is an invalid header value.`), "test");
    expect(msg).not.toContain("sb_secret");
  });

  it("does not leak a ClickBank key when the request itself throws", async () => {
    const throwing = (async () => {
      throw new TypeError('Headers.set: "API-SECRETSECRETSECRET1" is an invalid header value.');
    }) as unknown as typeof fetch;
    const r = await checkApiKey("API-SECRETSECRETSECRET1", throwing);
    expect(JSON.stringify(r)).not.toContain("SECRETSECRET");
  });
});

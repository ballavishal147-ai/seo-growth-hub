import { z } from "zod";

/**
 * Environment strategy:
 * - Server-only secrets: never prefixed, never imported into client code.
 * - Client-exposed values: must be prefixed NEXT_PUBLIC_ and are
 *   inlined at build time by Next.js.
 * - Both are validated once at startup so a missing/malformed var
 *   fails fast instead of surfacing as a runtime bug deep in the app.
 *
 * Extend `serverSchema` / `clientSchema` as Phase 5A / 5B introduce
 * real integrations (database URL, CMS tokens, analytics IDs, etc.).
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

const serverParsed = serverSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
});

const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!serverParsed.success) {
  console.error("Invalid server environment variables:", serverParsed.error.flatten());
  throw new Error("Invalid server environment variables");
}

if (!clientParsed.success) {
  console.error("Invalid client environment variables:", clientParsed.error.flatten());
  throw new Error("Invalid client environment variables");
}

export const env = {
  ...serverParsed.data,
  ...clientParsed.data,
};

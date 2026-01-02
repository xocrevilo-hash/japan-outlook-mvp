// lib/opsMeta.ts
import { kv } from "@vercel/kv";

export type OpsMeta = {
  ticker: string;
  last_published_iso?: string; // ISO timestamp
  override_active?: boolean;   // whether KV override should be used
  version?: string;            // optional meta (e.g. "v1.0")
  notes?: string;
};

function keyMeta(ticker: string) {
  return `ops:meta:${ticker}`;
}

/**
 * Read Ops metadata for a ticker (server-side).
 * Safe: returns null if missing or KV not reachable.
 */
export async function getOpsMeta(ticker?: string): Promise<OpsMeta | null> {
  if (!ticker) return null;

  try {
    const v = (await kv.get(keyMeta(ticker))) as any;
    if (!v || typeof v !== "object") return null;

    return {
      ticker,
      last_published_iso: v.last_published_iso ?? v.lastPublished ?? v.published_at ?? undefined,
      override_active: v.override_active ?? v.overrideActive ?? v.kv_override ?? false,
      version: v.version ?? undefined,
      notes: v.notes ?? undefined,
    };
  } catch {
    return null;
  }
}

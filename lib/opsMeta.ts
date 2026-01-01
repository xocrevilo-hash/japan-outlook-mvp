import { kv } from "@vercel/kv";

export async function getOpsMeta(ticker: string) {
  try {
    const meta = await kv.get<{
      run?: string;
      published_at?: string;
    }>(`outlook:meta:${ticker}`);

    return meta ?? null;
  } catch {
    return null;
  }
}

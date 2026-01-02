// lib/pageViews.ts
export type PageViewsMap = Record<string, number[]>;

const KEY = "page_views_v1";

function safeParse(raw: string | null): PageViewsMap {
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? (obj as PageViewsMap) : {};
  } catch {
    return {};
  }
}

function read(): PageViewsMap {
  if (typeof window === "undefined") return {};
  return safeParse(window.localStorage.getItem(KEY));
}

function write(m: PageViewsMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(m));
}

export function recordView(slug: string) {
  if (typeof window === "undefined") return;
  const m = read();
  const now = Date.now();
  const arr = Array.isArray(m[slug]) ? m[slug] : [];
  arr.push(now);

  // keep only last ~90 days to stop it growing forever
  const cutoff = now - 90 * 24 * 60 * 60 * 1000;
  m[slug] = arr.filter((t) => typeof t === "number" && t >= cutoff);

  write(m);
}

export function getTrending(n = 5): { slug: string; views: number }[] {
  if (typeof window === "undefined") return [];
  const m = read();
  const now = Date.now();
  const cutoff = now - 30 * 24 * 60 * 60 * 1000;

  const rows = Object.entries(m).map(([slug, arr]) => {
    const views = (Array.isArray(arr) ? arr : []).filter((t) => t >= cutoff).length;
    return { slug, views };
  });

  return rows
    .filter((r) => r.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, n);
}
// --- Compatibility export used by app/jp/[slug]/ViewTracker.tsx ---
export function trackView(slugOrTicker: string) {
  // If you already have a canonical tracker, call it here instead.
  // For now, keep it simple + safe for client-side localStorage.

  if (typeof window === "undefined") return;

  const key = "page_views_v1";
  const now = Date.now();

  try {
    const raw = window.localStorage.getItem(key);
    const obj = raw ? (JSON.parse(raw) as Record<string, number[]>) : {};
    const arr = Array.isArray(obj[slugOrTicker]) ? obj[slugOrTicker] : [];
    arr.push(now);
    obj[slugOrTicker] = arr.slice(-50); // cap history per company
    window.localStorage.setItem(key, JSON.stringify(obj));
  } catch {
    // ignore storage errors
  }
}

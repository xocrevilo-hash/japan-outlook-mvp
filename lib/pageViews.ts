const KEY = "page_views_v1";

type Store = Record<string, number[]>; // slug -> timestamps (ms)

function load(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function save(s: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function trackView(slug: string) {
  const s = load();
  const now = Date.now();
  const arr = s[slug] || [];
  arr.push(now);

  // keep last 60 days
  const cutoff = now - 60 * 24 * 60 * 60 * 1000;
  s[slug] = arr.filter((t) => t >= cutoff);

  save(s);
}

export function counts(slug: string) {
  const s = load();
  const now = Date.now();
  const arr = s[slug] || [];
  const d1 = now - 24 * 60 * 60 * 1000;
  const w1 = now - 7 * 24 * 60 * 60 * 1000;
  const m1 = now - 30 * 24 * 60 * 60 * 1000;

  return {
    d1: arr.filter((t) => t >= d1).length,
    w1: arr.filter((t) => t >= w1).length,
    m1: arr.filter((t) => t >= m1).length,
  };
}

export function topSlugs(window: "1d" | "1w" | "1m", limit = 10) {
  const s = load();
  const now = Date.now();
  const cutoff =
    window === "1d"
      ? now - 24 * 60 * 60 * 1000
      : window === "1w"
      ? now - 7 * 24 * 60 * 60 * 1000
      : now - 30 * 24 * 60 * 60 * 1000;

  return Object.entries(s)
    .map(([slug, ts]) => ({
      slug,
      views: (ts || []).filter((t) => t >= cutoff).length,
    }))
    .filter((x) => x.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

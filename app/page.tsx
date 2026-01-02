"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { allCompanies, searchCompanies } from "../lib/companies";

type Company = ReturnType<typeof allCompanies>[number];

type TrendingItem = {
  slug: string;
  count: number;
  company?: Company;
};

function readPageViews(): Record<string, number[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("page_views_v1");
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? (obj as Record<string, number[]>) : {};
  } catch {
    return {};
  }
}

function computeTrending(companies: Company[], topN = 5): TrendingItem[] {
  const views = readPageViews();
  const now = Date.now();
  const cutoff = now - 7 * 24 * 60 * 60 * 1000; // last 7 days
  const bySlug: TrendingItem[] = Object.entries(views).map(([slug, arr]) => {
    const list = Array.isArray(arr) ? arr : [];
    const recent = list.filter((t) => typeof t === "number" && t >= cutoff);
    return { slug, count: recent.length };
  });

  const map = new Map(companies.map((c) => [c.slug, c] as const));

  return bySlug
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)
    .map((x) => ({ ...x, company: map.get(x.slug) }));
}

export default function HomePage() {
  const companies = useMemo(() => allCompanies(), []);
  const recentlyUpdated = useMemo(() => {
    // Simple: sort by last_reviewed desc if present, otherwise keep JSON order
    const copy = [...companies];
    copy.sort((a, b) => {
      const da = a.outlook?.last_reviewed ?? "";
      const db = b.outlook?.last_reviewed ?? "";
      return db.localeCompare(da);
    });
    return copy.slice(0, 10);
  }, [companies]);

  // Search state
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const query = q.trim();
    if (!query) return [];
    // uses lib/companies.ts searchCompanies (already in your repo)
    return searchCompanies(query).slice(0, 8);
  }, [q]);

  // Trending state (client-only)
  const [trending, setTrending] = useState<TrendingItem[]>([]);

  useEffect(() => {
    // compute once on mount and whenever the user returns to the tab
    const run = () => setTrending(computeTrending(companies, 5));
    run();
    window.addEventListener("focus", run);
    return () => window.removeEventListener("focus", run);
  }, [companies]);

  // Chat box (UI stub)
  const [chat, setChat] = useState("");

  return (
    <main className="wrap">
      {/* Top bar */}
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div className="brand">Japan Outlook (MVP)</div>
          <div className="muted" style={{ fontSize: 14 }}>
            Fundamental outlooks on Japan-listed companies (6–12 month horizon).
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="pill">
            <span style={{ fontWeight: 700 }}>EN</span>
            <span className="muted"> / </span>
            <span className="muted">JP (soon)</span>
          </div>

          <Link href="/admin" className="link">
            Internal Ops
          </Link>
        </div>
      </div>

      {/* Search card */}
      <section className="card" style={{ marginTop: 18 }}>
        <div className="muted" style={{ fontWeight: 700, letterSpacing: 0.08, textTransform: "uppercase" }}>
          Search Japan-listed companies
        </div>

        <div style={{ fontSize: 44, fontWeight: 900, marginTop: 6, lineHeight: 1.05 }}>
          Fundamental Outlook (6–12m)
        </div>

        <div className="muted" style={{ marginTop: 10 }}>
          Type a company name (JP/EN), ticker (e.g., 4755), or a tag.
        </div>

        <div style={{ position: "relative", marginTop: 14 }}>
          <input
            className="input"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              // allow click selection
              setTimeout(() => setOpen(false), 120);
            }}
            placeholder="Rakuten / 4755 / Telecom / MLCC …"
          />

          {/* Dropdown */}
          {open && q.trim() && (
            <div className="dropdown">
              {results.length === 0 ? (
                <div className="dropdownItem muted">No matches.</div>
              ) : (
                results.map((c) => (
                  <Link key={c.slug} href={`/jp/${c.slug}`} className="dropdownItem">
                    <div style={{ fontWeight: 750 }}>
                      {c.name_en} <span className="muted">({c.ticker})</span>
                    </div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      {c.segment} · {c.sector}
                      {c.tags?.length ? ` · ${c.tags.slice(0, 3).join(", ")}` : ""}
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Two-column grid */}
      <section className="grid2">
        {/* Recently updated */}
        <div className="card">
          <div className="sectionTitle">Recently updated</div>

          <div style={{ marginTop: 10 }}>
            {recentlyUpdated.map((c) => (
              <div key={c.slug} className="row">
                <Link href={`/jp/${c.slug}`} className="rowLink">
                  <span style={{ fontWeight: 800 }}>{c.name_en}</span>{" "}
                  <span className="muted">({c.ticker})</span>
                </Link>

                <span className="muted" style={{ fontSize: 13 }}>
                  Outlook {c.outlook?.version ?? "v0"}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <Link href="/admin" className="link">
              Internal Ops Dashboard
            </Link>
          </div>
        </div>

        {/* Trending + chat */}
        <div className="card">
          <div className="sectionTitle">Trending (local)</div>
          <div className="muted" style={{ marginTop: 8 }}>
            Based on page views stored in your browser (localStorage).
          </div>

          <div style={{ marginTop: 10 }}>
            {trending.length === 0 ? (
              <div className="muted">
                No view data yet. Open a couple of company pages, then refresh.
              </div>
            ) : (
              <ol style={{ margin: "8px 0 0 18px" }}>
                {trending.map((t) => (
                  <li key={t.slug} style={{ marginBottom: 8 }}>
                    {t.company ? (
                      <Link href={`/jp/${t.company.slug}`} className="rowLink">
                        <span style={{ fontWeight: 800 }}>{t.company.name_en}</span>{" "}
                        <span className="muted">({t.company.ticker})</span>
                      </Link>
                    ) : (
                      <span style={{ fontWeight: 700 }}>{t.slug}</span>
                    )}
                    <span className="muted"> · {t.count} views</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <hr className="hr" />

          <div className="sectionTitle">Ask Japan Outlook</div>
          <div className="muted" style={{ marginTop: 8 }}>
            (Stub) Later this becomes a real chatbot window. For now it’s just a UI placeholder.
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <input
              className="input"
              value={chat}
              onChange={(e) => setChat(e.target.value)}
              placeholder="Ask about Rakuten, MLCCs, telecom pricing, etc…"
            />
            <button
              className="btn"
              onClick={() => {
                // placeholder action
                alert("Chatbot is a stub for now 🙂");
                setChat("");
              }}
            >
              Ask
            </button>
          </div>
        </div>
      </section>

      <div className="footer muted">
        MVP: {companies.length} companies · No paywall/analytics/newsfeed yet.
      </div>
    </main>
  );
}

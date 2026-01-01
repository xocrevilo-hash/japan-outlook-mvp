"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { allCompanies } from "../lib/companies";
import { topSlugs } from "../lib/pageViews";

type AnyCompany = any;

function norm(s: string) {
  return (s || "").toLowerCase().trim();
}

function bulletToText(b: any): string {
  if (b == null) return "";
  if (typeof b === "string") return b;
  if (typeof b === "number") return String(b);

  if (typeof b === "object") {
    if (typeof b.body === "string") return b.body;
    if (typeof b.claim === "string") return b.claim;
    if (typeof b.text === "string") return b.text;
  }
  try {
    return JSON.stringify(b);
  } catch {
    return String(b);
  }
}

function companyCorpus(c: AnyCompany): string {
  const bullets = Array.isArray(c?.outlook?.bullets) ? c.outlook.bullets : [];
  const risks = bulletToText(c?.outlook?.primary_risks);
  const bulletText = bullets.map(bulletToText).join(" ");
  return `${c?.name ?? ""} ${c?.ticker ?? ""} ${c?.slug ?? ""} ${bulletText} ${risks}`.toLowerCase();
}

function countHits(haystack: string, needle: string) {
  if (!needle) return 0;
  return haystack.split(needle).length - 1;
}

function matchesTickerOrName(q: string, c: AnyCompany) {
  const qq = norm(q);
  if (!qq) return false;

  const ticker = norm(String(c?.ticker ?? ""));
  const name = norm(String(c?.name ?? ""));
  const slug = norm(String(c?.slug ?? ""));

  if (ticker && (ticker === qq || ticker.startsWith(qq))) return true;
  if (name && name.includes(qq)) return true;
  if (slug && slug.includes(qq)) return true;

  return false;
}

function AskJapanOutlookBox() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, width: 340, zIndex: 50 }}>
      {!open ? (
        <button
          className="btn"
          onClick={() => setOpen(true)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 14px",
          }}
        >
          <span style={{ fontWeight: 750 }}>Ask Japan Outlook</span>
          <span className="tag">Soon</span>
        </button>
      ) : (
        <div className="card" style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 800 }}>Ask Japan Outlook</div>
            <button className="btn" onClick={() => setOpen(false)}>Close</button>
          </div>

          <p className="muted small" style={{ marginTop: 8 }}>
            Short-form analytical Q&A about a company or theme. (UI stub — mechanics later.)
          </p>

          <input
            className="input"
            placeholder="e.g., What matters for Rakuten Mobile in 2026?"
            disabled
            style={{ width: "100%", marginTop: 10 }}
          />

          <div className="muted small" style={{ marginTop: 10 }}>
            Examples:
            <div>• “Summarise key risks for Rohm”</div>
            <div>• “Which companies mention margin pressure?”</div>
            <div>• “Theme: Japan telecom — what’s changing?”</div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrendingCard({ companies }: { companies: AnyCompany[] }) {
  const [tab, setTab] = useState<"1d" | "1w" | "1m">("1w");
  const [rows, setRows] = useState<{ slug: string; views: number }[]>([]);

  // localStorage is only available in-browser, so compute after mount
  useEffect(() => {
    setRows(topSlugs(tab, 8));
  }, [tab]);

  const bySlug = useMemo(() => {
    const m = new Map<string, AnyCompany>();
    companies.forEach((c) => m.set(c.slug, c));
    return m;
  }, [companies]);

  return (
    <div className="card" style={{ margin: "0 auto 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div className="muted small" style={{ letterSpacing: 0.6 }}>HEAT RANKING</div>
          <div style={{ fontWeight: 800, marginTop: 2 }}>Trending</div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className={`btn ${tab === "1d" ? "" : "muted"}`} onClick={() => setTab("1d")}>1d</button>
          <button className={`btn ${tab === "1w" ? "" : "muted"}`} onClick={() => setTab("1w")}>1w</button>
          <button className={`btn ${tab === "1m" ? "" : "muted"}`} onClick={() => setTab("1m")}>1m</button>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        {rows.length === 0 ? (
          <p className="muted small" style={{ marginTop: 8 }}>
            No view data yet. Visit a few company pages and come back.
          </p>
        ) : (
          rows.map((r, idx) => {
            const c = bySlug.get(r.slug);
            if (!c) return null;
            return (
              <Link
                key={r.slug}
                href={`/jp/${c.slug}`}
                className="rowlink"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 12px",
                  borderTop: "1px solid #f0f0f0",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="tag">{idx + 1}</span>
                  <div>
                    <div style={{ fontWeight: 750 }}>
                      {c.name} <span className="muted">({c.ticker} JP)</span>
                    </div>
                    <div className="muted small">{r.views} view{r.views === 1 ? "" : "s"}</div>
                  </div>
                </div>
                <div className="muted small">View →</div>
              </Link>
            );
          })
        )}
      </div>

      <div className="muted small" style={{ marginTop: 10 }}>
        Note: MVP ranking is per-device (localStorage). We can make it global later via Vercel KV.
      </div>
    </div>
  );
}

export default function HomePage() {
  const companies = useMemo(() => allCompanies(), []);
  const [q, setQ] = useState("");

  const recentlyUpdated = useMemo(() => companies.slice(0, 8), [companies]);

  const directMatches = useMemo(() => {
    const qq = norm(q);
    if (!qq) return [];
    return companies.filter((c) => matchesTickerOrName(qq, c)).slice(0, 20);
  }, [q, companies]);

  const keywordMatches = useMemo(() => {
    const qq = norm(q);
    if (!qq) return [];
    const scored = companies
      .map((c) => {
        const corpus = companyCorpus(c);
        const hits = countHits(corpus, qq);
        return { c, hits };
      })
      .filter((x) => x.hits > 0)
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 20);

    return scored;
  }, [q, companies]);

  const showResults = norm(q).length > 0;

  return (
    <main className="wrap">
      <div className="topbar">
        <a className="brand" href="/">Japan Outlook (MVP)</a>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="muted small">Search</span>
          <span className="tag">EN</span>
          <span className="muted small">/</span>
          <span className="tag muted">JP (soon)</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link className="small" href="/admin">Internal Ops</Link>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 920, margin: "28px auto 10px" }}>
        <div className="muted small" style={{ letterSpacing: 0.6 }}>
          SEARCH JAPAN-LISTED COMPANIES
        </div>
        <h1 style={{ margin: "6px 0 8px" }}>Fundamental Outlook (6–12m)</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Type a company name (JP/EN), ticker (e.g., 4755), or a keyword (e.g., “mobile losses”).
        </p>

        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rakuten / 4755 / mobile losses / margin pressure ..."
          style={{ width: "100%", marginTop: 12 }}
        />
      </div>

      {/* Results box BELOW search input */}
      {showResults && (
        <section style={{ maxWidth: 920, margin: "0 auto 16px" }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div className="muted small" style={{ letterSpacing: 0.6 }}>
                SEARCH RESULTS
              </div>
              <button className="btn" onClick={() => setQ("")}>Clear</button>
            </div>

            {directMatches.length === 0 && keywordMatches.length === 0 && (
              <p className="muted" style={{ marginTop: 12 }}>
                No matches found.
              </p>
            )}

            {directMatches.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div className="muted small" style={{ marginBottom: 8 }}>
                  Company / ticker matches
                </div>
                {directMatches.map((c: AnyCompany) => (
                  <Link
                    key={c.slug}
                    href={`/jp/${c.slug}`}
                    className="rowlink"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "14px 12px",
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 750 }}>
                        {c.name} <span className="muted">({c.ticker} JP)</span>
                      </div>
                      <div className="muted small">
                        {c?.outlook?.last_reviewed ? `Last reviewed: ${c.outlook.last_reviewed}` : "Last reviewed: —"}
                      </div>
                    </div>
                    <div className="muted small" style={{ alignSelf: "center" }}>
                      {c?.outlook?.version ? `Outlook ${c.outlook.version}` : "Outlook"}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {keywordMatches.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <div className="muted small" style={{ marginBottom: 8 }}>
                  Keyword matches (ranked)
                </div>

                {keywordMatches.map(({ c, hits }: any) => (
                  <Link
                    key={c.slug}
                    href={`/jp/${c.slug}`}
                    className="rowlink"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "14px 12px",
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 750 }}>
                        {c.name} <span className="muted">({c.ticker} JP)</span>
                      </div>
                      <div className="muted small">
                        {hits} hit{hits === 1 ? "" : "s"} in Outlook & risks
                      </div>
                    </div>
                    <div className="muted small" style={{ alignSelf: "center" }}>
                      View →
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="muted small" style={{ textAlign: "center", marginTop: 10 }}>
            Tip: keyword search scans Outlook bullets + Primary Risks across all companies.
          </div>
        </section>
      )}

      {/* Trending card */}
      <section style={{ maxWidth: 920, margin: "0 auto" }}>
        <TrendingCard companies={companies} />
      </section>

      {/* Recently Updated ALWAYS shown */}
      <section style={{ maxWidth: 920, margin: "0 auto" }}>
        <div className="card">
          <div className="muted small" style={{ letterSpacing: 0.6 }}>
            RECENTLY UPDATED
          </div>

          <div style={{ marginTop: 10 }}>
            {recentlyUpdated.map((c: AnyCompany) => (
              <Link
                key={c.slug}
                href={`/jp/${c.slug}`}
                className="rowlink"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 12px",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <div>
                  <div style={{ fontWeight: 750 }}>
                    {c.name} <span className="muted">({c.ticker} JP)</span>
                  </div>
                  <div className="muted small">
                    {c?.outlook?.last_reviewed ? `Last reviewed: ${c.outlook.last_reviewed}` : "Last reviewed: —"}
                  </div>
                </div>
                <div className="muted small" style={{ alignSelf: "center" }}>
                  {c?.outlook?.version ? `Outlook ${c.outlook.version}` : "Outlook"}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="muted small" style={{ textAlign: "center", marginTop: 16 }}>
          MVP: {companies.length} companies • Static export ready for Vercel/Netlify • No paywall/analytics/newsfeed yet.
        </div>
      </section>

      {/* Chatbot UI stub */}
      <AskJapanOutlookBox />
    </main>
  );
}

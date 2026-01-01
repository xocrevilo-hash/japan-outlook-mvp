"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { allCompanies } from "../lib/companies";

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
  // basic substring hit count (overlaps not counted; fine for MVP)
  return haystack.split(needle).length - 1;
}

function matchesTickerOrName(q: string, c: AnyCompany) {
  const qq = norm(q);
  if (!qq) return false;

  const ticker = norm(String(c?.ticker ?? ""));
  const name = norm(String(c?.name ?? ""));
  const slug = norm(String(c?.slug ?? ""));

  // ticker exact or prefix
  if (ticker && (ticker === qq || ticker.startsWith(qq))) return true;

  // name contains
  if (name && name.includes(qq)) return true;

  // slug contains
  if (slug && slug.includes(qq)) return true;

  return false;
}

export default function HomePage() {
  const companies = useMemo(() => allCompanies(), []);

  const [q, setQ] = useState("");

  // Recently updated list (simple: keep existing order in data if you’ve curated it)
  // If you later add last_reviewed/version fields consistently, we can sort by date.
  const recentlyUpdated = useMemo(() => {
    // show first 8 max
    return companies.slice(0, 8);
  }, [companies]);

  const directMatches = useMemo(() => {
    const qq = norm(q);
    if (!qq) return [];
    return companies.filter((c) => matchesTickerOrName(qq, c)).slice(0, 20);
  }, [q, companies]);

  const keywordMatches = useMemo(() => {
    const qq = norm(q);
    if (!qq) return [];

    // If we already have direct matches, still show keyword matches, but rank separately.
    // This is useful for “mobile losses” etc.
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
        <div style={{ marginLeft: "auto" }}>
          <Link className="small" href="/admin">Internal Ops</Link>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 920, margin: "28px auto 16px" }}>
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

      {!showResults && (
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
      )}

      {showResults && (
        <section style={{ maxWidth: 920, margin: "0 auto" }}>
          <div className="card">
            <div className="muted small" style={{ letterSpacing: 0.6 }}>
              RESULTS
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

          <div className="muted small" style={{ textAlign: "center", marginTop: 16 }}>
            Tip: keyword search scans Outlook bullets + Primary Risks across all companies.
          </div>
        </section>
      )}
    </main>
  );
}

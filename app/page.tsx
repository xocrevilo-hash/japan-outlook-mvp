'use client';

import React from 'react';
import { searchCompanies, allCompanies } from '../lib/companies';

export default function HomePage() {
  const [q, setQ] = React.useState('');
  const results = React.useMemo(() => searchCompanies(q).slice(0, 10), [q]);
  const recently = React.useMemo(() => {
    // V1: just show these four in a stable order
    const tickers = new Set(['4755','6976','4676','6963']);
    return allCompanies().filter(c => tickers.has(c.ticker));
  }, []);

  return (
    <main className="container">
      <div className="card">
        <div className="kicker">Search Japan-listed companies</div>
        <div className="h1">Fundamental Outlook (6–12m)</div>
        <p className="muted">Type a company name (JP/EN), ticker (e.g., 4755), or a tag (e.g., Telecom).</p>
        <input
          className="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rakuten / 4755 / Telecom / MLCC …"
          aria-label="Search"
        />

        {q.trim().length > 0 && (
          <div className="results" role="list">
            {results.length === 0 && (
              <div className="small muted">No matches.</div>
            )}
            {results.map((c) => (
              <a className="row" key={c.slug} href={`/jp/${c.slug}`} role="listitem">
                <div className="rowTop">
                  <div><strong>{c.name_en}</strong> <span className="muted">({c.ticker} JP)</span></div>
                  <div className="small">{c.segment} • {c.sector}</div>
                </div>
                <div className="tags">
                  {c.tags?.slice(0,3).map((t) => <span className="tag" key={t}>{t}</span>)}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div style={{height: 18}} />

      <div className="card">
        <div className="kicker">Recently updated</div>
        <div className="results">
          {recently.map((c) => (
            <a className="row" key={c.slug} href={`/jp/${c.slug}`}>
              <div className="rowTop">
                <div><strong>{c.name_en}</strong> <span className="muted">({c.ticker} JP)</span></div>
                <div className="small">Outlook {c.outlook.version}</div>
              </div>
              <div className="small muted">Last reviewed: {c.outlook.last_reviewed}</div>
            </a>
          ))}
        </div>
      </div>

      <div className="footer">
        MVP: 4 companies • Static export ready for Vercel/Netlify • No paywall/analytics/newsfeed yet.
      </div>
    </main>
  );
}

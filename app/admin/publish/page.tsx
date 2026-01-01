"use client";

import { useMemo, useState } from "react";

type ParsedItem =
  | { ticker: string; target: "bullet"; bullet_no: number; text: string }
  | { ticker: string; target: "risks"; text: string };

function parsePatch(raw: string): { detectedRunDate: string | null; items: ParsedItem[]; errors: string[] } {
  const lines = raw.split(/\r?\n/);
  const errors: string[] = [];

  // Detect "Publish patch (run YYYY-MM-DD)"
  let detectedRunDate: string | null = null;
  const header = lines.find((l) => l.toLowerCase().includes("publish patch (run"));
  if (header) {
    const m = header.match(/run\s+(\d{4}-\d{2}-\d{2})/i);
    if (m) detectedRunDate = m[1];
  }

  const items: ParsedItem[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Match: "4755 Rakuten Group — Bullet #1"
    // or:    "6963 Rohm — Primary Risks"
    const m = line.match(/^(\d{4,5})\s+.*—\s+(Bullet\s+#(\d+)|Primary\s+Risks)\s*$/i);
    if (!m) {
      i += 1;
      continue;
    }

    const ticker = m[1];
    const isBullet = !!m[3];
    const bulletNo = m[3] ? Number(m[3]) : null;

    // Next lines until blank line = body
    i += 1;
    const bodyLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "") {
      bodyLines.push(lines[i]);
      i += 1;
    }
    const text = bodyLines.join("\n").trim();

    if (!text) {
      errors.push(`Missing text for ${ticker} ${isBullet ? `Bullet #${bulletNo}` : "Primary Risks"}`);
      i += 1;
      continue;
    }

    if (isBullet && typeof bulletNo === "number" && !Number.isNaN(bulletNo)) {
      items.push({ ticker, target: "bullet", bullet_no: bulletNo, text });
    } else {
      items.push({ ticker, target: "risks", text });
    }

    i += 1; // skip blank line
  }

  // Note: we do NOT error if no detected run date; manual override is valid.

  return { detectedRunDate, items, errors };
}

export default function PublishPage() {
  const [raw, setRaw] = useState("");
  const [runDateManual, setRunDateManual] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [status, setStatus] = useState<string>("");

  const parsed = useMemo(() => parsePatch(raw), [raw]);

  const runDate = (runDateManual.trim() || parsed.detectedRunDate || "").trim();
  const runDateOk = /^\d{4}-\d{2}-\d{2}$/.test(runDate);

  async function publish() {
    setStatus(dryRun ? "Dry run (no write)..." : "Publishing...");
    try {
      const res = await fetch("/api/ops/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runDate, items: parsed.items, dryRun }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus(`Error: ${json?.error || "publish failed"}`);
        return;
      }
      if (dryRun) {
        setStatus(`✅ Dry run ok: would publish ${json.count} update(s) for run ${runDate}`);
      } else {
        setStatus(`✅ Published ${json.count} update(s) for run ${runDate}`);
      }
    } catch (e: any) {
      setStatus(`Error: ${e?.message || "publish failed"}`);
    }
  }

  return (
    <main className="container">
      <div className="topbar" style={{ borderBottom: "none", paddingBottom: 6 }}>
        <a className="brand" href="/admin">Internal Ops</a>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <a className="small" href="/">Public site</a>
        </div>
      </div>

      <h1 style={{ marginTop: 8 }}>Publish approved updates</h1>
      <p className="muted" style={{ marginTop: 6 }}>
        Paste the “Copy patch list” output here. This writes <b>outlook overrides</b> to KV (no JSON edits).
      </p>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="muted small">RUN DATE</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
          <input
            className="input"
            style={{ padding: "10px 12px", minWidth: 220 }}
            placeholder="YYYY-MM-DD (required)"
            value={runDateManual}
            onChange={(e) => setRunDateManual(e.target.value)}
          />
          <div className="muted small">
            Detected: <b>{parsed.detectedRunDate || "—"}</b> · Using: <b>{runDate || "—"}</b>
          </div>

          <label style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
            <span className="small">Dry run (no KV write)</span>
          </label>
        </div>
        {!runDateOk && runDate ? (
          <div className="small" style={{ marginTop: 8 }}>
            ⚠ Run date must be YYYY-MM-DD
          </div>
        ) : null}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="muted small">PATCH TEXT</div>
        <textarea
          className="input"
          style={{ width: "100%", minHeight: 260, padding: 12, marginTop: 8 }}
          placeholder="Paste patch list here..."
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span className="tag">Parsed items: {parsed.items.length}</span>

          <button className="btn" onClick={publish} disabled={!runDateOk || parsed.items.length === 0}>
            {dryRun ? "Validate patch" : "Publish to KV"}
          </button>

          <span className="muted small">{status}</span>
        </div>

        {parsed.errors.length ? (
          <div style={{ marginTop: 10 }}>
            <div className="muted small">Warnings</div>
            <ul>
              {parsed.errors.map((e, idx) => (
                <li key={idx} className="small">{e}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {parsed.items.length ? (
          <div style={{ marginTop: 10 }}>
            <div className="muted small">Preview</div>
            <ul>
              {parsed.items.map((it, idx) => (
                <li key={idx} className="small">
                  <b>{it.ticker}</b> — {it.target === "bullet" ? `Bullet #${it.bullet_no}` : "Primary Risks"}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!parsed.detectedRunDate && raw.trim().length > 0 ? (
          <div className="small" style={{ marginTop: 10 }}>
            Tip: if you paste the header line <b>Publish patch (run YYYY-MM-DD)</b>, run date will auto-detect.
          </div>
        ) : null}
      </div>

      <p style={{ marginTop: 16 }}>
        <a href="/admin">← Back to dashboard</a>
      </p>
    </main>
  );
}

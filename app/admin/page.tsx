"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { weeklyRuns } from "../../data/runs";
import ReviewDrawer from "./components/ReviewDrawer";
import {
  clearDecisions,
  loadDecisions,
  saveDecisions,
  upsertDecision,
} from "../../lib/opsDecisions";

export default function AdminDashboard() {
  const runs = [...weeklyRuns].sort((a: any, b: any) => (a.date < b.date ? 1 : -1));
  const latest = runs[0];

  const makeId = (x: any) => `${x.ticker}__${x.suggested_action}__${x.reason}`;

  const baseQueue = latest.action_required.map((x: any) => ({
    ...x,
    id: makeId(x),
  }));

  const [queue, setQueue] = useState<any[]>(baseQueue);
  const [selected, setSelected] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Apply persisted decisions on load
  useEffect(() => {
    const saved = loadDecisions(latest.date);
    if (!saved.length) return;

    setQueue((prev) =>
      prev.map((x) => {
        const hit = saved.find((d: any) => d.id === x.id);
        return hit ? { ...x, status: hit.status } : x;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latest.date]);

  const pending = queue.filter((x) => x.status === "Needs review");
  const completed = queue.filter((x) => x.status !== "Needs review");

  const flaggedCount = pending.length;
  const approvedCount = queue.filter((x) => x.status === "Approved").length;

  return (
    <main className="wrap">
      <div className="topbar" style={{ marginBottom: 18 }}>
        <a className="brand" href="/">Japan Outlook</a>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="tag">Internal Ops</span>
          <a className="small" href="/">Public site</a>

          <button
            className="btn"
            onClick={() => {
              const payload = {
                runDate: latest.date,
                exportedAt: new Date().toISOString(),
                decisions: loadDecisions(latest.date),
              };
              const blob = new Blob([JSON.stringify(payload, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `decisions-${latest.date}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export decisions
          </button>

          <button className="btn" onClick={() => fileInputRef.current?.click()}>
            Import decisions
          </button>

          <button
            className="btn"
            onClick={() => {
              clearDecisions(latest.date);
              setQueue(baseQueue);
              setSelected(null);
            }}
          >
            Clear
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              try {
                const text = await file.text();
                const parsed = JSON.parse(text);
                const runDate = parsed?.runDate;
                const decisions = parsed?.decisions;

                if (!runDate || !Array.isArray(decisions)) {
                  e.currentTarget.value = "";
                  return;
                }

                saveDecisions(runDate, decisions);

                if (runDate === latest.date) {
                  setQueue((prev) =>
                    prev.map((x) => {
                      const hit = decisions.find((d: any) => d.id === x.id);
                      return hit ? { ...x, status: hit.status } : x;
                    })
                  );
                }
              } catch {
                // ignore invalid JSON
              } finally {
                e.currentTarget.value = "";
              }
            }}
          />
        </div>
      </div>

      <h1 style={{ margin: "6px 0 6px" }}>Internal Ops Dashboard</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Latest run: <b>{latest.date}</b> • Last scan: <b>{latest.health.last_scan}</b>
      </p>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="muted small">Companies monitored</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{latest.companies_monitored}</div>
        </div>
        <div className="card">
          <div className="muted small">Flagged (action required)</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{flaggedCount}</div>
        </div>
        <div className="card">
          <div className="muted small">Approved updates</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{approvedCount}</div>
        </div>
        <div className="card">
          <div className="muted small">Errors</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{latest.errors}</div>
        </div>
      </div>

      <section style={{ marginTop: 22 }}>
        <h2>Action Required</h2>
        <div className="card" style={{ overflowX: "auto" }}>
          {pending.length === 0 ? (
            <p className="muted">No items pending review.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Ticker</th>
                  <th>Reason</th>
                  <th>Suggested</th>
                  <th>Confidence</th>
                  <th>Sources</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((x) => (
                  <tr
                    key={x.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelected(x)}
                  >
                    <td>{x.company}</td>
                    <td>{x.ticker}</td>
                    <td className="muted">{x.reason}</td>
                    <td>{x.suggested_action}</td>
                    <td><span className="tag">{x.confidence}</span></td>
                    <td className="muted">{x.sources.join(" + ")}</td>
                    <td>{x.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section style={{ marginTop: 22 }}>
        <h2>Completed this run</h2>
        <div className="card" style={{ overflowX: "auto" }}>
          {completed.length === 0 ? (
            <p className="muted">No completed items yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Ticker</th>
                  <th>Suggested</th>
                  <th>Outcome</th>
                  <th>Confidence</th>
                  <th>Sources</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((x) => (
                  <tr
                    key={x.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelected(x)}
                  >
                    <td>{x.company}</td>
                    <td>{x.ticker}</td>
                    <td className="muted">{x.suggested_action}</td>
                    <td><span className="tag">{x.status}</span></td>
                    <td><span className="tag">{x.confidence}</span></td>
                    <td className="muted">{x.sources.join(" + ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section style={{ marginTop: 22, paddingBottom: 40 }}>
        <h2>Weekly Log</h2>
        <div className="card">
          {runs.map((r: any) => (
            <div
              key={r.date}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <div>
                <Link href={`/admin/run/${r.date}`}><b>{r.date}</b></Link>
                <div className="muted small">
                  {r.flagged_count} flagged • {r.approved_updates} updates • {r.errors} errors
                </div>
              </div>
              <Link className="small" href={`/admin/run/${r.date}`}>View →</Link>
            </div>
          ))}
        </div>
      </section>

      <ReviewDrawer
        open={!!selected}
        item={selected}
        onClose={() => setSelected(null)}
        onAction={(action) => {
          const id = selected?.id;
          if (!id) return;

          setQueue((prev) =>
            prev.map((x) => (x.id === id ? { ...x, status: action } : x))
          );

          upsertDecision(latest.date, {
            runDate: latest.date,
            id,
            ticker: selected.ticker,
            company: selected.company,
            status: action,
            decidedAt: new Date().toISOString(),
          });

          setSelected(null);
        }}
      />
    </main>
  );
}

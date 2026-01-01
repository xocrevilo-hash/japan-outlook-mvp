"use client";

import { useMemo, useState } from "react";

type Item = {
  id?: string;
  company: string;
  ticker: string;
  reason: string;
  suggested_action: string;
  confidence: string;
  sources: string[];
  status: string;

  // optional (may or may not exist in data)
  action_type?: string;
  bullet_no?: number;
  current_bullet?: string;
  proposed_bullet?: string;
};

function inferActionType(x: Item): "Bullet" | "Risk" | "NoChange" {
  const sa = (x.suggested_action || "").toLowerCase();
  const r = (x.reason || "").toLowerCase();
  const id = (x.id || "").toLowerCase();

  if (x.action_type) {
    const v = x.action_type.toLowerCase();
    if (v.includes("risk")) return "Risk";
    if (v.includes("no")) return "NoChange";
    return "Bullet";
  }

  // Heuristics for current MVP data
  if (sa.includes("primary risks") || sa.includes("risk")) return "Risk";
  if (id.includes("risks")) return "Risk";
  if (r.includes("risk") && !x.bullet_no) return "Risk";

  if (sa.includes("no change") || sa.includes("noise")) return "NoChange";

  return "Bullet";
}

function normalizeConfidence(c: string): "High" | "Medium" | "Low" | "Other" {
  const v = (c || "").toLowerCase();
  if (v.includes("high")) return "High";
  if (v.includes("med")) return "Medium";
  if (v.includes("low")) return "Low";
  return "Other";
}

export default function RunClient({
  runDate,
  lastFullScanJst,
  actionRequired,
  completed,
}: {
  runDate: string;
  lastFullScanJst?: string;
  actionRequired: Item[];
  completed: any[];
}) {
  const [statusFilter, setStatusFilter] = useState<string>("Needs review");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [confFilter, setConfFilter] = useState<string>("All");

  const enriched = useMemo(() => {
    return (actionRequired || []).map((x) => ({
      ...x,
      _actionType: inferActionType(x),
      _conf: normalizeConfidence(x.confidence),
    }));
  }, [actionRequired]);

  const filtered = useMemo(() => {
    return enriched.filter((x) => {
      const okStatus = statusFilter === "All" ? true : x.status === statusFilter;
      const okType = typeFilter === "All" ? true : x._actionType === typeFilter;
      const okConf = confFilter === "All" ? true : x._conf === confFilter;
      return okStatus && okType && okConf;
    });
  }, [enriched, statusFilter, typeFilter, confFilter]);

  const counts = useMemo(() => {
    const total = enriched.length;
    const needs = enriched.filter((x) => x.status === "Needs review").length;
    const bullet = enriched.filter((x) => x._actionType === "Bullet").length;
    const risk = enriched.filter((x) => x._actionType === "Risk").length;
    const noChange = enriched.filter((x) => x._actionType === "NoChange").length;
    return { total, needs, bullet, risk, noChange };
  }, [enriched]);

  return (
    <main className="container">
      <div className="topbar" style={{ borderBottom: "none", paddingBottom: 6 }}>
        <a className="brand" href="/admin">Internal Ops</a>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <a className="small" href="/">Public site</a>
        </div>
      </div>

      <h1 style={{ marginTop: 8 }}>Run: {runDate}</h1>
      {lastFullScanJst ? (
        <p className="muted" style={{ marginTop: 6 }}>
          Last full scan: <b>{lastFullScanJst}</b>
        </p>
      ) : null}

      {/* Filter bar */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="muted small" style={{ letterSpacing: 0.6 }}>
          FILTERS
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <div>
            <div className="muted small">Status</div>
            <select
              className="input"
              style={{ padding: "10px 12px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Needs review">Needs review (default)</option>
              <option value="All">All</option>
              <option value="Approved">Approved</option>
              <option value="Deferred">Deferred</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <div className="muted small">Action type</div>
            <select
              className="input"
              style={{ padding: "10px 12px" }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Bullet">Update Bullet</option>
              <option value="Risk">Update Primary Risks</option>
              <option value="NoChange">No change (noise)</option>
            </select>
          </div>

          <div>
            <div className="muted small">Confidence</div>
            <select
              className="input"
              style={{ padding: "10px 12px" }}
              value={confFilter}
              onChange={(e) => setConfFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "flex-end" }}>
            <span className="tag">Total: {counts.total}</span>
            <span className="tag">Needs review: {counts.needs}</span>
            <span className="tag">Bullet: {counts.bullet}</span>
            <span className="tag">Risk: {counts.risk}</span>
            <span className="tag">Noise: {counts.noChange}</span>
          </div>
        </div>

        <div className="muted small" style={{ marginTop: 10 }}>
          Showing <b>{filtered.length}</b> of <b>{counts.total}</b>
        </div>
      </div>

      {/* Action required table */}
      <section style={{ marginTop: 14 }}>
        <h2>Action required</h2>
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Company</th>
                <th>Ticker</th>
                <th>Why flagged</th>
                <th>Suggested</th>
                <th>Confidence</th>
                <th>Sources</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="muted">No items match the filters.</td></tr>
              ) : (
                filtered.map((x: any, i: number) => (
                  <tr key={x.id ?? i}>
                    <td>
                      <span className="tag">
                        {x._actionType === "Bullet"
                          ? "Update Bullet"
                          : x._actionType === "Risk"
                          ? "Update Risks"
                          : "No Change"}
                      </span>
                      {typeof x.bullet_no === "number" && x._actionType === "Bullet" ? (
                        <div className="muted small" style={{ marginTop: 6 }}>
                          Bullet #{x.bullet_no}
                        </div>
                      ) : null}
                    </td>
                    <td>{x.company}</td>
                    <td>{x.ticker}</td>
                    <td>{x.reason}</td>
                    <td>{x.suggested_action}</td>
                    <td>{x.confidence}</td>
                    <td>{Array.isArray(x.sources) ? x.sources.join(" + ") : x.sources}</td>
                    <td><b>{x.status}</b></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Completed table (unchanged, but kept) */}
      <section style={{ marginTop: 18 }}>
        <h2>Completed this run</h2>
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Ticker</th>
                <th>Decision</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {(!completed || completed.length === 0) ? (
                <tr><td colSpan={4} className="muted">None</td></tr>
              ) : (
                completed.map((x: any, i: number) => (
                  <tr key={`${x.ticker}-${i}`}>
                    <td>{x.company}</td>
                    <td>{x.ticker}</td>
                    <td><b>{x.decision}</b></td>
                    <td>{x.notes ?? ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p style={{ marginTop: 16 }}>
        <a href="/admin">← Back to dashboard</a>
      </p>
    </main>
  );
}

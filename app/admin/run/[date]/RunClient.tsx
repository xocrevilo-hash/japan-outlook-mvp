"use client";

import { useEffect, useMemo, useState } from "react";

type ActionType = "Bullet" | "Risk" | "NoChange";
type Decision = "Approved" | "Deferred" | "Rejected" | "NoChange";

type Item = {
  id?: string;
  company: string;
  ticker: string;
  reason: string;
  suggested_action: string;
  confidence: string;
  sources: string[];
  status: string;

  action_type: ActionType;
  pm_note?: string;

  bullet_no?: number;
  current_bullet?: string;
  proposed_bullet?: string;
};

type DecisionRecord = {
  runDate: string;
  id: string;
  ticker: string;
  company: string;
  action_type: ActionType;
  decision: Decision;
  pm_note?: string;
  decided_at_iso: string;
};

function storageKey(runDate: string) {
  return `ops_decisions_v1:${runDate}`;
}

function normalizeConfidence(c: string): "High" | "Medium" | "Low" | "Other" {
  const v = (c || "").toLowerCase();
  if (v.includes("high")) return "High";
  if (v.includes("med")) return "Medium";
  if (v.includes("low")) return "Low";
  return "Other";
}

function labelActionType(t: ActionType) {
  if (t === "Bullet") return "Update Bullet";
  if (t === "Risk") return "Update Risks";
  return "No change";
}

function decisionToStatus(d: Decision): string {
  if (d === "NoChange") return "No change";
  return d;
}

/** Minimal drawer (no dependencies) */
function Drawer({
  open,
  item,
  onClose,
  onSave,
}: {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  onSave: (decision: Decision, pmNote: string) => void;
}) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open && item) setNote(item.pm_note ?? "");
  }, [open, item]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <aside className="drawer">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div className="muted small">Review item</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {item.company} ({item.ticker})
            </div>
            <div className="muted small">{labelActionType(item.action_type)}</div>
          </div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>

        <div style={{ marginTop: 14 }}>
          <div className="muted small">Why flagged</div>
          <div style={{ fontWeight: 650 }}>{item.reason}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="muted small">Suggested action</div>
          <div>{item.suggested_action}</div>
        </div>

        {typeof item.bullet_no === "number" ? (
          <div style={{ marginTop: 12 }}>
            <div className="muted small">Target</div>
            <div>Bullet #{item.bullet_no}</div>
          </div>
        ) : null}

        {item.current_bullet ? (
          <div style={{ marginTop: 12 }}>
            <div className="muted small">Current</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{item.current_bullet}</div>
          </div>
        ) : null}

        {item.proposed_bullet ? (
          <div style={{ marginTop: 12 }}>
            <div className="muted small">Proposed</div>
            <div style={{ whiteSpace: "pre-wrap", fontWeight: 650 }}>
              {item.proposed_bullet}
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 12 }}>
          <div className="muted small">Confidence</div>
          <div>{item.confidence}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="muted small">Sources</div>
          <div className="small muted">
            {Array.isArray(item.sources) ? item.sources.join(" + ") : String(item.sources)}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div className="muted small">PM override note (optional)</div>
          <textarea
            className="input"
            style={{ width: "100%", minHeight: 90, padding: 12 }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Already reflected in Bullet 2. Monitor next quarter."
          />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <button className="btn" onClick={() => onSave("Approved", note)}>Approve</button>
          <button className="btn" onClick={() => onSave("Deferred", note)}>Defer</button>
          <button className="btn" onClick={() => onSave("Rejected", note)}>Reject</button>
          <button className="btn" onClick={() => onSave("NoChange", note)}>Mark noise</button>
        </div>

        <p className="muted small" style={{ marginTop: 10 }}>
          Decisions are stored locally for now (per device). Later we can move this to a shared store.
        </p>
      </aside>
    </>
  );
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

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);

  const [decisionMap, setDecisionMap] = useState<Record<string, DecisionRecord>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(runDate));
      if (!raw) return;
      const arr: DecisionRecord[] = JSON.parse(raw);
      const map: Record<string, DecisionRecord> = {};
      for (const r of arr) map[r.id] = r;
      setDecisionMap(map);
    } catch {
      // ignore
    }
  }, [runDate]);

  const enriched = useMemo(() => {
    return (actionRequired || []).map((x) => {
      const id = x.id ?? `${x.ticker}-${x.action_type}-${x.bullet_no ?? "na"}`;
      const rec = decisionMap[id];
      const status = rec ? decisionToStatus(rec.decision) : x.status;
      const pm_note = rec?.pm_note ?? x.pm_note ?? "";
      return {
        ...x,
        id,
        status,
        pm_note,
        _conf: normalizeConfidence(x.confidence),
      };
    });
  }, [actionRequired, decisionMap]);

  const filtered = useMemo(() => {
    return enriched.filter((x: any) => {
      const okStatus = statusFilter === "All" ? true : x.status === statusFilter;
      const okType = typeFilter === "All" ? true : x.action_type === typeFilter;
      const okConf = confFilter === "All" ? true : x._conf === confFilter;
      return okStatus && okType && okConf;
    });
  }, [enriched, statusFilter, typeFilter, confFilter]);

  const counts = useMemo(() => {
    const total = enriched.length;
    const needs = enriched.filter((x: any) => x.status === "Needs review").length;
    const bullet = enriched.filter((x: any) => x.action_type === "Bullet").length;
    const risk = enriched.filter((x: any) => x.action_type === "Risk").length;
    const noise = enriched.filter((x: any) => x.action_type === "NoChange").length;
    return { total, needs, bullet, risk, noise };
  }, [enriched]);

  const completedDerived = useMemo(() => {
    const local = Object.values(decisionMap).map((r) => ({
      company: r.company,
      ticker: r.ticker,
      decision: r.decision,
      notes: r.pm_note || "",
      decided_at_iso: r.decided_at_iso,
    }));
    return [...(completed || []), ...local];
  }, [completed, decisionMap]);

  function openRow(x: Item) {
    setSelected(x);
    setOpen(true);
  }

  function saveDecision(decision: Decision, pmNote: string) {
    if (!selected) return;

    const id = selected.id ?? `${selected.ticker}-${selected.action_type}-${selected.bullet_no ?? "na"}`;

    const rec: DecisionRecord = {
      runDate,
      id,
      ticker: selected.ticker,
      company: selected.company,
      action_type: selected.action_type,
      decision,
      pm_note: pmNote,
      decided_at_iso: new Date().toISOString(),
    };

    const next = { ...decisionMap, [id]: rec };
    setDecisionMap(next);

    try {
      localStorage.setItem(storageKey(runDate), JSON.stringify(Object.values(next)));
    } catch {
      // ignore
    }

    setOpen(false);
    setSelected(null);
  }

  return (
    <>
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

        <div className="card" style={{ marginTop: 12 }}>
          <div className="muted small" style={{ letterSpacing: 0.6 }}>FILTERS</div>

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
                <option value="No change">No change</option>
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
              <span className="tag">Needs: {counts.needs}</span>
              <span className="tag">Bullet: {counts.bullet}</span>
              <span className="tag">Risk: {counts.risk}</span>
              <span className="tag">Noise: {counts.noise}</span>
            </div>
          </div>

          <div className="muted small" style={{ marginTop: 10 }}>
            Showing <b>{filtered.length}</b> of <b>{counts.total}</b> · Click a row to decide
          </div>
        </div>

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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="muted">No items match the filters.</td></tr>
                ) : (
                  filtered.map((x: any, i: number) => (
                    <tr
                      key={x.id ?? i}
                      style={{ cursor: "pointer" }}
                      onClick={() => openRow(x)}
                      title="Click to review"
                    >
                      <td>
                        <span className="tag">{labelActionType(x.action_type)}</span>
                        {typeof x.bullet_no === "number" && x.action_type === "Bullet" ? (
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
                      <td><b>{x.status}</b></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

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
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {completedDerived.length === 0 ? (
                  <tr><td colSpan={5} className="muted">None</td></tr>
                ) : (
                  completedDerived.map((x: any, i: number) => (
                    <tr key={`${x.ticker}-${i}`}>
                      <td>{x.company}</td>
                      <td>{x.ticker}</td>
                      <td><b>{x.decision}</b></td>
                      <td>{x.notes ?? ""}</td>
                      <td className="muted small">
                        {x.decided_at_iso ? new Date(x.decided_at_iso).toLocaleString() : ""}
                      </td>
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

      <Drawer
        open={open}
        item={selected}
        onClose={() => { setOpen(false); setSelected(null); }}
        onSave={saveDecision}
      />
    </>
  );
}

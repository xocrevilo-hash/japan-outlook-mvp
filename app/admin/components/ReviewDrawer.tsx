"use client";

import { useEffect } from "react";

type DrawerItem = {
  id?: string;
  company: string;
  ticker: string;
  reason: string;
  suggested_action: string;
  confidence: string;
  sources: string[];
  status: string;
  bullet_no?: number;
  current_bullet?: string;
  proposed_bullet?: string;
};

export default function ReviewDrawer({
  open,
  item,
  onClose,
  onAction,
}: {
  open: boolean;
  item: DrawerItem | null;
  onClose: () => void;
  onAction: (action: "Approved" | "Rejected" | "Deferred") => void;
}) {
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
            <div className="muted small">Review</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {item.company} ({item.ticker})
            </div>
            <div className="muted small">{item.suggested_action}</div>
          </div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>

        <div style={{ marginTop: 14 }}>
          <div className="muted small">Why flagged</div>
          <div style={{ fontWeight: 650 }}>{item.reason}</div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <span className="tag">Confidence: {item.confidence}</span>
          <span className="tag">{item.sources.join(" + ")}</span>
          <span className="tag">Status: {item.status}</span>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="muted small">
            Bullet {item.bullet_no ?? "—"} (Current → Proposed)
          </div>

          <div className="card" style={{ marginTop: 8 }}>
            <div className="muted small">Current</div>
            <div style={{ marginTop: 6 }}>{item.current_bullet ?? "—"}</div>
          </div>

          <div className="card" style={{ marginTop: 10 }}>
            <div className="muted small">Proposed</div>
            <div style={{ marginTop: 6 }}>{item.proposed_bullet ?? "—"}</div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>

         <button className="btn" onClick={() => onAction("Approved")}>Approve</button>
         <button className="btn" onClick={() => onAction("Approved")}>Edit & approve</button>
         <button className="btn" onClick={() => onAction("Rejected")}>Reject</button>
         <button className="btn" onClick={() => onAction("Deferred")}>Defer</button>          
        
        </div>

        <p className="muted small" style={{ marginTop: 10 }}>
          (Stub) Buttons don’t persist yet — we’ll wire persistence later.
        </p>
      </aside>
    </>
  );
}

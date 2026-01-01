export type AdminRunItem = {
  id?: string;
  company: string;
  ticker: string;
  reason: string;
  suggested_action: string;
  confidence: string;
  sources: string[];
  status: string;

  // added in Step 2A/2B
  action_type: "Bullet" | "Risk" | "NoChange";
  bullet_no?: number;
  current_bullet?: string;
  proposed_bullet?: string;
};

export type AdminRun = {
  date: string; // YYYY-MM-DD
  last_full_scan_jst?: string;
  summary?: {
    flagged?: number;
    approved_updates?: number;
    errors?: number;
  };
  action_required: AdminRunItem[];
  completed?: Array<{
    company: string;
    ticker: string;
    decision: string;
    notes?: string;
    decided_at_iso?: string;
  }>;
};

/**
 * Canonical export used by /admin and /admin/run/[date]
 * Keep the name stable to avoid import drift.
 */
export const ADMIN_RUNS: AdminRun[] = [
  {
    date: "2025-12-31",
    last_full_scan_jst: "2025-12-31 13:20 JST",
    summary: { flagged: 3, approved_updates: 1, errors: 0 },
    action_required: [
      {
        id: "4755-Bullet-1",
        company: "Rakuten Group",
        ticker: "4755",
        reason: "Management emphasis shift (unit economics vs growth) referenced more prominently",
        suggested_action: "Update Bullet 1",
        confidence: "High",
        sources: ["TDnet", "Transcript"],
        status: "Needs review",
        action_type: "Bullet",
        bullet_no: 1,
        current_bullet: "Mobile losses remain the dominant near-term drag on group profitability.",
        proposed_bullet:
          "Mobile losses remain the dominant near-term drag, with management emphasis increasingly on unit economics and a credible path to profitability over the next few quarters.",
      },
      {
        id: "6963-Risk-na",
        company: "Rohm",
        ticker: "6963",
        reason: "End-market weakness flagged as a more material downside risk",
        suggested_action: "Update Primary Risks",
        confidence: "Low",
        sources: ["News"],
        status: "Needs review",
        action_type: "Risk",
        proposed_bullet:
          "Primary risks: a sharper-than-expected downturn in autos/industrial demand, prolonged inventory correction, and margin pressure if pricing remains weak or utilization stays depressed.",
      },
      {
        id: "4751-NoChange-na",
        company: "CyberAgent",
        ticker: "4751",
        reason: "Minor headline noise; no durable fundamental change identified",
        suggested_action: "No change (noise)",
        confidence: "Low",
        sources: ["News"],
        status: "Needs review",
        action_type: "NoChange",
      },
    ],
    completed: [
      {
        company: "Fuji Media Holdings",
        ticker: "4676",
        decision: "Approved",
        notes: "Minor wording refinement approved.",
        decided_at_iso: "2025-12-31T13:05:00+09:00",
      },
    ],
  },
];

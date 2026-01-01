export type ActionType = "Bullet" | "Risk" | "NoChange";

export type ActionRequiredItem = {
  id?: string;
  company: string;
  ticker: string;
  reason: string;
  suggested_action: string;
  confidence: "High" | "Medium" | "Low" | string;
  sources: string[];
  status: "Needs review" | "Approved" | "Rejected" | "Deferred" | string;

  // Step 2B.1: explicit action typing (no inference)
  action_type: ActionType;

  // Optional editorial / PM note (not public)
  pm_note?: string;

  // Optional bullet targeting / diffs (for Bullet updates)
  bullet_no?: number;
  current_bullet?: string;
  proposed_bullet?: string;
};

export type CompletedItem = {
  company: string;
  ticker: string;
  decision: "Approved" | "Rejected" | "Deferred" | "NoChange" | string;
  notes?: string;
  decided_at_iso?: string;
};

export type AdminRun = {
  date: string; // YYYY-MM-DD
  last_full_scan_jst?: string;

  summary: {
    companies_monitored: number;
    flagged: number;
    approved_updates: number;
    errors: number;
  };

  action_required: ActionRequiredItem[];
  completed: CompletedItem[];
};

export const ADMIN_RUNS: AdminRun[] = [
  {
    date: "2025-12-31",
    last_full_scan_jst: "2025-12-31 13:20 JST",
    summary: {
      companies_monitored: 14,
      flagged: 4,
      approved_updates: 1,
      errors: 0,
    },

    action_required: [
      {
        id: "4755-b1",
        company: "Rakuten Group",
        ticker: "4755",
        action_type: "Bullet",
        reason: "Management emphasis shift (unit economics vs growth) referenced more prominently",
        suggested_action: "Update Bullet 1",
        confidence: "High",
        sources: ["TDnet", "Transcript"],
        status: "Needs review",
        pm_note: "",
        bullet_no: 1,
        current_bullet:
          "Mobile losses remain the dominant near-term drag on group profitability, while core internet businesses provide stability.",
        proposed_bullet:
          "Mobile losses remain the dominant near-term drag, with management increasingly emphasizing unit economics and capital discipline alongside growth.",
      },
      {
        id: "6976-b2",
        company: "Taiyo Yuden",
        ticker: "6976",
        action_type: "Bullet",
        reason: "Margin pressure highlighted more frequently in commentary",
        suggested_action: "Update Bullet 2",
        confidence: "Medium",
        sources: ["Transcript"],
        status: "Deferred",
        pm_note: "",
        bullet_no: 2,
        current_bullet:
          "MLCC demand recovery is gradual, with profitability leveraged to mix and utilization.",
        proposed_bullet:
          "MLCC demand recovery is gradual, with margin pressure and mix/utilization highlighted more prominently as near-term drivers.",
      },
      {
        id: "6963-risk",
        company: "Rohm",
        ticker: "6963",
        action_type: "Risk",
        reason: "End-market weakness flagged as a more material downside risk",
        suggested_action: "Update Primary Risks",
        confidence: "Low",
        sources: ["News"],
        status: "Needs review",
        pm_note: "",
      },
      {
        id: "4751-noise",
        company: "CyberAgent",
        ticker: "4751",
        action_type: "NoChange",
        reason: "Minor headline noise; no durable fundamental change identified",
        suggested_action: "No change (noise)",
        confidence: "Low",
        sources: ["Social"],
        status: "Needs review",
        pm_note: "",
      },
    ],

    completed: [
      {
        company: "Fuji Media Holdings",
        ticker: "4676",
        decision: "Approved",
        notes: "Minor wording refinement approved.",
        decided_at_iso: "2025-12-31T05:05:00.000Z",
      },
    ],
  },
];

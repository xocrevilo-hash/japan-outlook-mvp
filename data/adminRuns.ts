// data/adminRuns.ts
// Canonical data + types for Admin Ops weekly runs

export type AdminRunItem = {
  id?: string;
  company: string;
  ticker: string;
  reason: string;
  suggested_action: string;
  confidence: string;
  sources: string[];
  status: string;

  // Step 2A / 2B classification
  action_type?: "Bullet" | "Risk" | "NoChange";
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
 * Alias type used by individual run files under data/runs/*
 * Keep this export to avoid breaking imports.
 */
export type WeeklyRun = AdminRun;

/**
 * Canonical export used by:
 * - /admin
 * - /admin/run/[date]
 *
 * ⚠️ Keep the name ADMIN_RUNS stable.
 */
export const ADMIN_RUNS: AdminRun[] = [
  {
    date: "2025-12-31",
    last_full_scan_jst: "2025-12-31 13:20 JST",
    summary: {
      flagged: 3,
      approved_updates: 1,
      errors: 0,
    },
    action_required: [
      {
        id: "4755-Bullet-1",
        company: "Rakuten Group",
        ticker: "4755",
        reason:
          "Management emphasis shift toward unit economics referenced more prominently in recent disclosures",
        suggested_action: "Update Bullet 1",
        confidence: "High",
        sources: ["TDnet", "Earnings transcript"],
        status: "Needs review",
        action_type: "Bullet",
        bullet_no: 1,
        current_bullet:
          "Mobile losses remain the dominant near-term drag on group profitability.",
        proposed_bullet:
          "Mobile losses remain the dominant near-term drag, with management placing increasing emphasis on unit economics and ARPU stabilization.",
      },
      {
        id: "6963-Risk-1",
        company: "Rohm",
        ticker: "6963",
        reason:
          "End-market demand softness (autos / industrial) framed more explicitly as a downside risk",
        suggested_action: "Update Primary Risks",
        confidence: "Low",
        sources: ["TDnet"],
        status: "Needs review",
        action_type: "Risk",
      },
    ],
    completed: [],
  },
];

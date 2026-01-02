// data/adminRuns.ts
// Canonical data + types for Admin Ops weekly runs
// IMPORTANT: This file must remain backwards-compatible with older run files in data/runs/*
// so Vercel/Next builds do not break when schema evolves.

export type AdminRunItem = {
  id?: string;
  company: string;
  ticker: string;
  reason: string;
  suggested_action: string;
  confidence: string;
  sources: string[];
  status: string;

  // Classification (newer runs may include these)
  action_type?: "Bullet" | "Risk" | "NoChange";
  bullet_no?: number;
  current_bullet?: string;
  proposed_bullet?: string;
};

export type AdminRun = {
  // Core
  date: string; // YYYY-MM-DD

  // Newer-style metadata
  last_full_scan_jst?: string;

  // Newer-style summary (preferred going forward)
  summary?: {
    flagged?: number;
    approved_updates?: number;
    deferred?: number;
    errors?: number;
  };

  // Legacy summary fields used by older run files
  companies_monitored?: number;
  flagged_count?: number;
  approved_updates?: number;
  deferred?: number;
  errors?: number;

  // Legacy “health” block used by older run files
  health?: {
    last_scan?: string;
    tdnet?: string;
    transcripts?: string;
    news?: string;
    social?: string;
    kv?: string;
    notes?: string;
  };

  // Action queue (newer runs)
  action_required?: AdminRunItem[];

  // Completed decisions (newer runs)
  completed?: Array<{
    company: string;
    ticker: string;

    // allow either "decision" (new) or "outcome" (legacy)
    decision?: string;
    outcome?: string;

    // optional extra metadata often useful in logs
    version?: string;
    notes?: string;
    decided_at_iso?: string;

    // allow additional fields without breaking builds
    [key: string]: any;
  }>;


  // Critical MVP escape hatch:
  // allow legacy/extra fields in historical run files without breaking TypeScript builds
  [key: string]: any;
};

/**
 * Alias type used by individual run files under data/runs/*
 * Keep this export stable to avoid breaking imports like:
 *   import type { WeeklyRun } from "../adminRuns";
 */
export type WeeklyRun = AdminRun;

/**
 * Canonical export used by:
 * - /admin
 * - /admin/run/[date]
 *
 * Keep the name ADMIN_RUNS stable.
 */
export const ADMIN_RUNS: AdminRun[] = [
  {
    date: "2025-12-31",
    last_full_scan_jst: "2025-12-31 13:20 JST",
    summary: {
      flagged: 3,
      approved_updates: 1,
      deferred: 0,
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

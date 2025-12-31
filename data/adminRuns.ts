export type Confidence = "High" | "Medium" | "Low";
export type SourceTag = "TDnet" | "Transcript" | "News" | "Social";

export type FlagItem = {
  ticker: string;
  company: string;
  reason: string;
  suggested_action: string; // e.g. "Update Bullet 2"
  confidence: Confidence;
  sources: SourceTag[];
  status: "Needs review" | "Approved" | "Edited" | "Rejected" | "Deferred";
};

export type ChangeLogItem = {
  ticker: string;
  company: string;
  change: string; // e.g. "Bullet 1 updated"
  version_from: string;
  version_to: string;
  note: string;
};

export type OverrideItem = {
  ticker: string;
  company: string;
  override_type: "Force-review" | "Pin bullets" | "Editor-authored change" | "Event mode";
  note: string;
  expires: string; // date
  status: "Active" | "Expired";
};

export type RunHealth = {
  tdnet: "OK" | "Lagging" | "Down";
  transcripts: "OK" | "Lagging" | "Down";
  news: "OK" | "Lagging" | "Down";
  social: "OK" | "Lagging" | "Down";
  last_scan: string; // ISO string or readable
};

export type WeeklyRun = {
  date: string; // YYYY-MM-DD
  companies_monitored: number;
  flagged_count: number;
  approved_updates: number;
  deferred: number;
  errors: number;
  health: RunHealth;
  action_required: FlagItem[];
  overrides: OverrideItem[];
  changelog: ChangeLogItem[];
  completed: Array<{ ticker: string; company: string; outcome: "No change" | "Updated"; version: string }>;
};

export const weeklyRuns: WeeklyRun[] = [
  {
    date: "2025-12-31",
    companies_monitored: 14,
    flagged_count: 3,
    approved_updates: 1,
    deferred: 1,
    errors: 0,
    health: {
      tdnet: "OK",
      transcripts: "OK",
      news: "OK",
      social: "OK",
      last_scan: "2025-12-31 13:20 JST",
    },
    action_required: [
      {
        ticker: "4755",
        company: "Rakuten Group",
        reason: "Management emphasis shift (unit economics vs growth)",
        suggested_action: "Update Bullet 1",
        confidence: "High",
        sources: ["TDnet", "Transcript"],
        status: "Needs review",
      },
      {
        ticker: "6976",
        company: "Taiyo Yuden",
        reason: "Margin pressure referenced more prominently",
        suggested_action: "Update Bullet 2",
        confidence: "Medium",
        sources: ["Transcript"],
        status: "Deferred",
      },
      {
        ticker: "6963",
        company: "Rohm",
        reason: "Risk language changed (end-market weakness)",
        suggested_action: "Update Primary Risks",
        confidence: "Low",
        sources: ["News"],
        status: "Needs review",
      },
    ],
    overrides: [
      {
        ticker: "4676",
        company: "Fuji Media Holdings",
        override_type: "Event mode",
        note: "High newsflow window; increase sensitivity temporarily.",
        expires: "2026-01-14",
        status: "Active",
      },
    ],
    changelog: [
      {
        ticker: "4755",
        company: "Rakuten Group",
        change: "Bullet 1 updated",
        version_from: "v1",
        version_to: "v2",
        note: "Added emphasis on unit economics/cost discipline per latest commentary.",
      },
    ],
    completed: [
      { ticker: "4755", company: "Rakuten Group", outcome: "Updated", version: "v2" },
      { ticker: "6976", company: "Taiyo Yuden", outcome: "No change", version: "v1" },
      { ticker: "4676", company: "Fuji Media Holdings", outcome: "No change", version: "v1" },
      { ticker: "6963", company: "Rohm", outcome: "No change", version: "v1" },
    ],
  },
  {
    date: "2025-12-24",
    companies_monitored: 14,
    flagged_count: 1,
    approved_updates: 0,
    deferred: 0,
    errors: 0,
    health: {
      tdnet: "OK",
      transcripts: "OK",
      news: "OK",
      social: "OK",
      last_scan: "2025-12-24 09:10 JST",
    },
    action_required: [
      {
        ticker: "4755",
        company: "Rakuten Group",
        reason: "New press release (minor operational update)",
        suggested_action: "No change recommended",
        confidence: "Low",
        sources: ["TDnet"],
        status: "Rejected",
      },
    ],
    overrides: [],
    changelog: [],
    completed: [
      { ticker: "4755", company: "Rakuten Group", outcome: "No change", version: "v1" },
      { ticker: "6976", company: "Taiyo Yuden", outcome: "No change", version: "v1" },
      { ticker: "4676", company: "Fuji Media Holdings", outcome: "No change", version: "v1" },
      { ticker: "6963", company: "Rohm", outcome: "No change", version: "v1" },
    ],
  },
];

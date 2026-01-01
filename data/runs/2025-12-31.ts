import type { WeeklyRun } from "../adminRuns";

const run: WeeklyRun = {
  date: "2025-12-31",
  companies_monitored: 14,
  flagged_count: 3,
  approved_updates: 1,
  deferred: 0,
  errors: 0,

  health: {
    last_scan: "2025-12-31 13:20 JST",
    tdnet: "OK",
    transcripts: "OK",
    news: "OK",
    social: "OK",
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
      bullet_no: 1,
      current_bullet:
        "Mobile losses remain the dominant near-term drag on group profitability.",
      proposed_bullet:
        "Mobile losses remain the dominant near-term drag, with management now emphasising unit economics and cost discipline over subscriber growth.",
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

  overrides: [],
  completed: [
    { ticker: "4676", company: "Fuji Media Holdings", outcome: "No change", version: "v1.0" },
  ],
  changelog: [],
};

export default run;

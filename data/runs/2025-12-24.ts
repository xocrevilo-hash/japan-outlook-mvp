import type { WeeklyRun } from "../adminRuns";

const run: WeeklyRun = {
  date: "2025-12-24",
  companies_monitored: 14,
  flagged_count: 1,
  approved_updates: 0,
  deferred: 0,
  errors: 0,

  health: {
    last_scan: "2025-12-24 13:20 JST",
    tdnet: "OK",
    transcripts: "OK",
    news: "OK",
    social: "OK",
  },

  action_required: [
    {
      ticker: "4755",
      company: "Rakuten Group",
      reason: "TDnet update referenced; needs review",
      suggested_action: "Review Bullet 3",
      confidence: "Low",
      sources: ["TDnet"],
      status: "Needs review",
    },
  ],

  overrides: [],
  completed: [],
  changelog: [],
};

export default run;

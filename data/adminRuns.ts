export type Confidence = "High" | "Medium" | "Low";
export type SourceTag = "TDnet" | "Transcript" | "News" | "Social";

export type FlagItem = {
  ticker: string;
  company: string;
  reason: string;
  suggested_action: string;
  confidence: Confidence;
  sources: SourceTag[];
  status: "Needs review" | "Approved" | "Rejected" | "Deferred";
  bullet_no?: number;
  current_bullet?: string;
  proposed_bullet?: string;
};

export type OverrideItem = {
  ticker: string;
  company: string;
  override_type: string;
  note: string;
  expires: string;
  status: string;
};

export type ChangeLogItem = {
  ticker: string;
  company: string;
  change: string;
  version_from: string;
  version_to: string;
  note: string;
};

export type RunHealth = {
  last_scan: string;
  tdnet: "OK" | "Lagging" | "Down";
  transcripts: "OK" | "Lagging" | "Down";
  news: "OK" | "Lagging" | "Down";
  social: "OK" | "Lagging" | "Down";
};

export type WeeklyRun = {
  date: string;
  companies_monitored: number;
  flagged_count: number;
  approved_updates: number;
  deferred: number;
  errors: number;
  health: RunHealth;
  action_required: FlagItem[];
  overrides: OverrideItem[];
  completed: Array<{
    ticker: string;
    company: string;
    outcome: "No change" | "Updated";
    version: string;
  }>;
  changelog: ChangeLogItem[];
};

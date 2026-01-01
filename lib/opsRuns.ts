import { weeklyRuns } from "../data/runs";

export function lastRunMentioningTicker(ticker: string): string | null {
  const t = String(ticker);

  const runs = [...weeklyRuns].sort((a: any, b: any) => (a.date < b.date ? 1 : -1));

  for (const r of runs) {
    const hit = (r.action_required || []).some((x: any) => String(x.ticker) === t);
    if (hit) return r.date;
  }
  return null;
}

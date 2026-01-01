export type DecisionStatus = "Approved" | "Rejected" | "Deferred";
export type DecisionRecord = {
  runDate: string;
  id: string;
  ticker: string;
  company: string;
  status: DecisionStatus;
  decidedAt: string; // ISO
};

const keyForRun = (runDate: string) => `ops_decisions__${runDate}`;

export function loadDecisions(runDate: string): DecisionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(keyForRun(runDate));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDecisions(runDate: string, decisions: DecisionRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(keyForRun(runDate), JSON.stringify(decisions));
}

export function upsertDecision(runDate: string, d: DecisionRecord) {
  const existing = loadDecisions(runDate);
  const next = [
    d,
    ...existing.filter((x) => x.id !== d.id),
  ];
  saveDecisions(runDate, next);
  return next;
}

export function clearDecisions(runDate: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(keyForRun(runDate));
}

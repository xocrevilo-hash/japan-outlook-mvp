import { ADMIN_RUNS } from "../../../../data/adminRuns";
import RunClient from "./RunClient";

export function generateStaticParams() {
  return ADMIN_RUNS.map((r) => ({ date: r.date }));
}

export default function RunPage({ params }: { params: { date: string } }) {
  const run = ADMIN_RUNS.find((r) => r.date === params.date);

  if (!run) {
    return (
      <main className="container">
        <p>Run not found.</p>
        <p><a href="/admin">Back to dashboard</a></p>
      </main>
    );
  }

  return (
    <RunClient
      runDate={run.date}
      lastFullScanJst={run.last_full_scan_jst}
      actionRequired={run.action_required as any}
      completed={run.completed as any}
    />
  );
}

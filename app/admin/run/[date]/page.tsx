import Link from "next/link";
import { ADMIN_RUNS } from "../../../../data/adminRuns";

export function generateStaticParams() {
  return ADMIN_RUNS.map((r) => ({ date: r.date }));
}

export default function RunPage({ params }: { params: { date: string } }) {
  const run = ADMIN_RUNS.find((r) => r.date === params.date);

  if (!run) {
    return (
      <main className="container">
        <p>Run not found.</p>
        <p><Link href="/admin">Back to dashboard</Link></p>
      </main>
    );
  }

  const pending = Array.isArray(run.action_required) ? run.action_required : [];
  const completed = Array.isArray(run.completed) ? run.completed : [];

  return (
    <main className="container">
      <div className="topbar" style={{ borderBottom: "none", paddingBottom: 6 }}>
        <a className="brand" href="/admin">Internal Ops</a>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link className="small" href="/">Public site</Link>
        </div>
      </div>

      <h1 style={{ marginTop: 8 }}>Run: {run.date}</h1>
      {run.last_full_scan_jst ? (
        <p className="muted" style={{ marginTop: 6 }}>
          Last full scan: <b>{run.last_full_scan_jst}</b>
        </p>
      ) : null}

      <section style={{ marginTop: 14 }}>
        <h2>Action required</h2>
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Ticker</th>
                <th>Reason flagged</th>
                <th>Suggested</th>
                <th>Confidence</th>
                <th>Sources</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr><td colSpan={7} className="muted">None</td></tr>
              ) : (
                pending.map((x: any, i: number) => (
                  <tr key={x.id ?? i}>
                    <td>{x.company}</td>
                    <td>{x.ticker}</td>
                    <td>{x.reason}</td>
                    <td>{x.suggested_action}</td>
                    <td>{x.confidence}</td>
                    <td>{Array.isArray(x.sources) ? x.sources.join(" + ") : x.sources}</td>
                    <td><b>{x.status}</b></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>Completed this run</h2>
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Ticker</th>
                <th>Decision</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {completed.length === 0 ? (
                <tr><td colSpan={4} className="muted">None</td></tr>
              ) : (
                completed.map((x: any, i: number) => (
                  <tr key={`${x.ticker}-${i}`}>
                    <td>{x.company}</td>
                    <td>{x.ticker}</td>
                    <td><b>{x.decision}</b></td>
                    <td>{x.notes ?? ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p style={{ marginTop: 16 }}>
        <Link href="/admin">← Back to dashboard</Link>
      </p>
    </main>
  );
}

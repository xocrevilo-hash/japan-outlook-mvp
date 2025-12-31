import Link from "next/link";
import { weeklyRuns } from "../../../../data/adminRuns";

export function generateStaticParams() {
  return weeklyRuns.map((r) => ({ date: r.date }));
}

export default function RunDetailPage({ params }: { params: { date: string } }) {
  const run = weeklyRuns.find((r) => r.date === params.date);

  if (!run) {
    return (
      <main className="wrap">
        <div className="topbar">
          <a className="brand" href="/">Japan Outlook</a>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link className="small" href="/admin">Back to dashboard</Link>
          </div>
        </div>
        <h1>Run not found</h1>
        <p className="muted">No run exists for date: {params.date}</p>
      </main>
    );
  }

  return (
    <main className="wrap" style={{ paddingBottom: 40 }}>
      <div className="topbar" style={{ marginBottom: 18 }}>
        <a className="brand" href="/">Japan Outlook</a>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link className="small" href="/admin">Internal Ops</Link>
          <span className="tag">Weekly Run</span>
        </div>
      </div>

      <h1 style={{ margin: "6px 0 6px" }}>Weekly Run: {run.date}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Monitored: <b>{run.companies_monitored}</b> • Flagged: <b>{run.flagged_count}</b> • Approved: <b>{run.approved_updates}</b> • Deferred: <b>{run.deferred}</b> • Errors: <b>{run.errors}</b>
      </p>

      <section style={{ marginTop: 18 }}>
        <h2>Action Required</h2>
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Ticker</th>
                <th>Reason</th>
                <th>Suggested</th>
                <th>Confidence</th>
                <th>Sources</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {run.action_required.map((x) => (
                <tr key={x.ticker + x.reason}>
                  <td>{x.company}</td>
                  <td>{x.ticker}</td>
                  <td className="muted">{x.reason}</td>
                  <td>{x.suggested_action}</td>
                  <td><span className="tag">{x.confidence}</span></td>
                  <td className="muted">{x.sources.join(" + ")}</td>
                  <td>{x.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>Completed</h2>
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Ticker</th>
                <th>Outcome</th>
                <th>Version</th>
              </tr>
            </thead>
            <tbody>
              {run.completed.map((c) => (
                <tr key={c.ticker}>
                  <td>{c.company}</td>
                  <td>{c.ticker}</td>
                  <td>{c.outcome}</td>
                  <td className="muted">{c.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>Changelog</h2>
        <div className="card">
          {run.changelog.length === 0 ? (
            <p className="muted">No production changes recorded for this run.</p>
          ) : (
            run.changelog.map((c) => (
              <div key={c.ticker + c.change} style={{ padding: "10px 0", borderTop: "1px solid #f0f0f0" }}>
                <div><b>{c.company}</b> ({c.ticker}) — {c.change}</div>
                <div className="muted small">Version: {c.version_from} → {c.version_to}</div>
                <div className="muted">{c.note}</div>
              </div>
            ))
          )}
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>Errors</h2>
        <div className="card">
          {run.errors === 0 ? (
            <p className="muted">No errors recorded.</p>
          ) : (
            <p className="muted">Errors exist (stub). In v2 we’ll list ingestion/build issues here.</p>
          )}
        </div>
      </section>
    </main>
  );
}

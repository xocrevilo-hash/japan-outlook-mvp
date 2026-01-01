import Link from "next/link";
import { weeklyRuns } from "../../../../data/runs";

export function generateStaticParams() {
  return weeklyRuns.map((r: any) => ({ date: r.date }));
}

export default function RunDetailPage({ params }: { params: { date: string } }) {
  const run = weeklyRuns.find((r: any) => r.date === params.date);

  if (!run) {
    return (
      <main className="wrap">
        <div className="topbar" style={{ marginBottom: 18 }}>
          <a className="brand" href="/">Japan Outlook</a>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span className="tag">Internal Ops</span>
            <a className="small" href="/admin">Back to dashboard</a>
          </div>
        </div>
        <h1>Run not found</h1>
        <p className="muted">No weekly snapshot exists for: {params.date}</p>
      </main>
    );
  }

  const pending = run.action_required.filter((x: any) => x.status === "Needs review");
  const completed = run.action_required.filter((x: any) => x.status !== "Needs review");

  return (
    <main className="wrap">
      <div className="topbar" style={{ marginBottom: 18 }}>
        <a className="brand" href="/">Japan Outlook</a>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className="tag">Internal Ops</span>
          <Link className="small" href="/admin">Back to dashboard</Link>
        </div>
      </div>

      <h1 style={{ margin: "6px 0 6px" }}>Weekly Run: {run.date}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Last full scan: <b>{run.health?.last_scan ?? "—"}</b>
      </p>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="muted small">Companies monitored</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{run.companies_monitored}</div>
        </div>
        <div className="card">
          <div className="muted small">Flagged (action required)</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{pending.length}</div>
        </div>
        <div className="card">
          <div className="muted small">Approved updates</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {run.action_required.filter((x: any) => x.status === "Approved").length}
          </div>
        </div>
        <div className="card">
          <div className="muted small">Errors</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{run.errors}</div>
        </div>
      </div>

      <section style={{ marginTop: 22 }}>
        <h2>Action Required</h2>
        <div className="card" style={{ overflowX: "auto" }}>
          {pending.length === 0 ? (
            <p className="muted">No items pending review for this run.</p>
          ) : (
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
                {pending.map((x: any) => (
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
          )}
          <p className="muted small" style={{ marginTop: 10 }}>
            This is a historical snapshot of the queue as of {run.date}.
          </p>
        </div>
      </section>

      <section style={{ marginTop: 22 }}>
        <h2>Completed this run</h2>
        <div className="card" style={{ overflowX: "auto" }}>
          {completed.length === 0 ? (
            <p className="muted">No completed items for this run.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Ticker</th>
                  <th>Suggested</th>
                  <th>Outcome</th>
                  <th>Confidence</th>
                  <th>Sources</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((x: any) => (
                  <tr key={x.ticker + x.reason}>
                    <td>{x.company}</td>
                    <td>{x.ticker}</td>
                    <td className="muted">{x.suggested_action}</td>
                    <td><span className="tag">{x.status}</span></td>
                    <td><span className="tag">{x.confidence}</span></td>
                    <td className="muted">{x.sources.join(" + ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="muted small" style={{ marginTop: 10 }}>
            Resolved items in this weekly snapshot.
          </p>
        </div>
      </section>

      <section style={{ marginTop: 22 }}>
        <h2>System Health</h2>
        <div className="grid2">
          <div className="card">
            <div className="muted small">TDnet ingestion</div>
            <div style={{ fontWeight: 700 }}>{run.health?.tdnet ?? "—"}</div>
          </div>
          <div className="card">
            <div className="muted small">Transcripts</div>
            <div style={{ fontWeight: 700 }}>{run.health?.transcripts ?? "—"}</div>
          </div>
          <div className="card">
            <div className="muted small">News</div>
            <div style={{ fontWeight: 700 }}>{run.health?.news ?? "—"}</div>
          </div>
          <div className="card">
            <div className="muted small">Social</div>
            <div style={{ fontWeight: 700 }}>{run.health?.social ?? "—"}</div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 22, paddingBottom: 40 }}>
        <h2>All runs</h2>
        <div className="card">
          {weeklyRuns
            .slice()
            .sort((a: any, b: any) => (a.date < b.date ? 1 : -1))
            .map((r: any) => (
              <div
                key={r.date}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <div>
                  <Link href={`/admin/run/${r.date}`}><b>{r.date}</b></Link>
                  <div className="muted small">
                    {r.flagged_count} flagged • {r.approved_updates} updates • {r.errors} errors
                  </div>
                </div>
                <Link className="small" href={`/admin/run/${r.date}`}>View →</Link>
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}

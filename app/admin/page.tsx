import Link from "next/link";
import { weeklyRuns } from "../../data/adminRuns";

export default function AdminDashboard() {
  const runs = [...weeklyRuns].sort((a, b) => (a.date < b.date ? 1 : -1));
  const latest = runs[0];

  return (
    <main className="wrap">
      <div className="topbar" style={{ marginBottom: 18 }}>
        <a className="brand" href="/">Japan Outlook</a>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className="tag">Internal Ops</span>
          <a className="small" href="/">Public site</a>
        </div>
      </div>

      <h1 style={{ margin: "6px 0 6px" }}>Internal Ops Dashboard</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Latest run: <b>{latest.date}</b> • Last full scan: <b>{latest.health.last_scan}</b>
      </p>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="muted small">Companies monitored</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{latest.companies_monitored}</div>
        </div>
        <div className="card">
          <div className="muted small">Flagged (action required)</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{latest.flagged_count}</div>
        </div>
        <div className="card">
          <div className="muted small">Approved updates</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{latest.approved_updates}</div>
        </div>
        <div className="card">
          <div className="muted small">Errors</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{latest.errors}</div>
        </div>
      </div>

      <section style={{ marginTop: 22 }}>
        <h2>Action Required</h2>
        <div className="card" style={{ overflowX: "auto" }}>
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
              {latest.action_required.map((x) => (
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
          <p className="muted small" style={{ marginTop: 10 }}>
            (Stub) Clicking rows will open a review drawer in v2.
          </p>
        </div>
      </section>

      <section style={{ marginTop: 22 }}>
        <h2>Manual Overrides</h2>
        <div className="card">
          {latest.overrides.length === 0 ? (
            <p className="muted">No active overrides.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Ticker</th>
                  <th>Override</th>
                  <th>Note</th>
                  <th>Expires</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {latest.overrides.map((o) => (
                  <tr key={o.ticker + o.override_type}>
                    <td>{o.company}</td>
                    <td>{o.ticker}</td>
                    <td>{o.override_type}</td>
                    <td className="muted">{o.note}</td>
                    <td className="muted">{o.expires}</td>
                    <td>{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="muted small" style={{ marginTop: 10 }}>
            (Stub) In v2 this becomes an “Add override” modal with expiry rules.
          </p>
        </div>
      </section>

      <section style={{ marginTop: 22 }}>
        <h2>System Health</h2>
        <div className="grid2">
          <div className="card">
            <div className="muted small">TDnet ingestion</div>
            <div style={{ fontWeight: 700 }}>{latest.health.tdnet}</div>
          </div>
          <div className="card">
            <div className="muted small">Transcripts</div>
            <div style={{ fontWeight: 700 }}>{latest.health.transcripts}</div>
          </div>
          <div className="card">
            <div className="muted small">News</div>
            <div style={{ fontWeight: 700 }}>{latest.health.news}</div>
          </div>
          <div className="card">
            <div className="muted small">Social</div>
            <div style={{ fontWeight: 700 }}>{latest.health.social}</div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 22, paddingBottom: 40 }}>
        <h2>Weekly Log</h2>
        <div className="card">
          {runs.map((r) => (
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

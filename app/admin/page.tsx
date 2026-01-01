import Link from "next/link";
import { ADMIN_RUNS } from "../../data/adminRuns";

export default function AdminPage() {
  const latest = ADMIN_RUNS?.[0];

  const companiesMonitored = latest?.summary?.companies_monitored ?? 0;
  const flagged = latest?.summary?.flagged ?? 0;
  const approved = latest?.summary?.approved_updates ?? 0;
  const errors = latest?.summary?.errors ?? 0;

  return (
    <main className="container">
      <div className="topbar" style={{ borderBottom: "none", paddingBottom: 6 }}>
        <a className="brand" href="/">Japan Outlook (MVP)</a>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link className="small" href="/">Public site</Link>
        </div>
      </div>

      <h1 style={{ marginTop: 8 }}>Internal Ops Dashboard</h1>
      <p className="muted" style={{ marginTop: 6 }}>
        Latest run: <b>{latest?.date ?? "—"}</b>
        {latest?.last_full_scan_jst ? (
          <> · Last full scan: <b>{latest.last_full_scan_jst}</b></>
        ) : null}
      </p>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="muted small">Companies monitored</div>
          <div style={{ fontSize: 34, fontWeight: 800 }}>{companiesMonitored}</div>
        </div>
        <div className="card">
          <div className="muted small">Flagged (action required)</div>
          <div style={{ fontSize: 34, fontWeight: 800 }}>{flagged}</div>
        </div>
        <div className="card">
          <div className="muted small">Approved updates</div>
          <div style={{ fontSize: 34, fontWeight: 800 }}>{approved}</div>
        </div>
        <div className="card">
          <div className="muted small">Errors</div>
          <div style={{ fontSize: 34, fontWeight: 800 }}>{errors}</div>
        </div>
      </div>

      <section style={{ marginTop: 18 }}>
        <h2 style={{ marginBottom: 8 }}>Runs</h2>

        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Flagged</th>
                <th>Approved</th>
                <th>Errors</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_RUNS.map((r) => (
                <tr key={r.date}>
                  <td>{r.date}</td>
                  <td>{r.summary?.flagged ?? 0}</td>
                  <td>{r.summary?.approved_updates ?? 0}</td>
                  <td>{r.summary?.errors ?? 0}</td>
                  <td>
                    <Link href={`/admin/run/${r.date}`}>Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

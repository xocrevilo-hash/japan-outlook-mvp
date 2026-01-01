import Link from "next/link";
import { ADMIN_RUNS } from "../../data/adminRuns";
import { allCompanies } from "../../lib/companies";

export default function AdminPage() {
  const companiesMonitored = allCompanies().length;

  const latest = ADMIN_RUNS?.[0];
  const flagged = latest?.summary?.flagged ?? 0;
  const approved = latest?.summary?.approved_updates ?? 0;
  const errors = latest?.summary?.errors ?? 0;

  return (
    <main className="container">
      <div className="topbar" style={{ borderBottom: "none", paddingBottom: 6 }}>
        <a className="brand" href="/admin">Internal Ops</a>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <a className="small" href="/">Public site</a>
        </div>
      </div>

      <h1 style={{ marginTop: 8 }}>Ops dashboard</h1>

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
        <h2 style={{ marginBottom: 8 }}>Actions</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/admin/run/${latest?.date}`} className="btn">
            Review latest run
          </Link>

          <Link href="/admin/publish" className="btn">
            Publish approved updates
          </Link>
        </div>
      </section>

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
              {(ADMIN_RUNS || []).map((r) => (
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

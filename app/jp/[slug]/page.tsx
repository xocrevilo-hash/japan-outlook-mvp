import Link from "next/link";
import { findBySlug } from "../../../lib/companies";
import { getOpsMeta } from "../../../lib/opsMeta";
import ViewTracker from "./ViewTracker";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmtIso(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export default async function CompanyPage({
  params,
}: {
  params: { slug: string };
}) {
  const c = findBySlug(params.slug);

  if (!c) {
    return (
      <main className="wrap">
        <h1>Not found</h1>
        <p className="muted">No company matches that slug.</p>
        <Link href="/">← Back</Link>
      </main>
    );
  }

  const opsMeta = await getOpsMeta(c.ticker);

  const lastPub = opsMeta?.last_published_iso;
  const overrideActive = !!opsMeta?.override_active;

  return (
    <main className="wrap">
      {/* client-side tracker for trending */}
      <ViewTracker slug={c.slug} ticker={c.ticker} />

      <div className="topbar" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>
            {c.name_en} ({c.ticker})
          </h1>
          <div className="muted" style={{ fontSize: 14 }}>
            {c.segment} · {c.sector}
            {c.tags?.length ? ` · ${c.tags.slice(0, 3).join(", ")}` : ""}
          </div>
        </div>

        {/* Ops badge */}
        <div
          className="card"
          style={{
            minWidth: 280,
            padding: 12,
            alignSelf: "flex-start",
          }}
        >
          <div className="muted" style={{ fontSize: 12, letterSpacing: 0.08, textTransform: "uppercase" }}>
            Ops update
          </div>

          <div style={{ marginTop: 6, fontWeight: 800 }}>
            {overrideActive ? "KV override active" : "KV override inactive"}
          </div>

          <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
            Last published: <span style={{ fontWeight: 650 }}>{fmtIso(lastPub)}</span>
          </div>

          {opsMeta?.version ? (
            <div className="muted" style={{ marginTop: 4, fontSize: 13 }}>
              Version: <span style={{ fontWeight: 650 }}>{opsMeta.version}</span>
            </div>
          ) : null}

          <div style={{ marginTop: 10 }}>
            <Link href="/admin" className="link">
              Internal Ops →
            </Link>
          </div>
        </div>
      </div>

      {/* Outlook content (existing local JSON) */}
      <section className="card" style={{ marginTop: 16 }}>
        <div className="sectionTitle">Outlook</div>

        {Array.isArray(c.outlook?.bullets) && c.outlook.bullets.length > 0 ? (
          <ol style={{ marginTop: 12, paddingLeft: 18 }}>
            {c.outlook.bullets.map((b: any) => (
              <li key={b.n ?? b.claim} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 850 }}>{b.claim}</div>
                <div className="muted" style={{ marginTop: 4 }}>
                  {b.body}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="muted" style={{ marginTop: 12 }}>
            No outlook bullets yet.
          </div>
        )}
      </section>

      <div style={{ marginTop: 18 }}>
        <Link href="/">← Back to search</Link>
      </div>
    </main>
  );
}

import Link from "next/link";
import { findBySlug } from "../../../lib/companies";
import { getOpsMeta } from "../../../lib/opsMeta";
import ViewTracker from "./ViewTracker";

// Defensive helper: supports string | string[] | undefined
function asText(v: any): string {
  if (!v) return "";
  if (Array.isArray(v)) return v.filter(Boolean).join("\n");
  if (typeof v === "string") return v;
  return String(v);
}

function isHighMediumLow(v: any): v is "High" | "Medium" | "Low" {
  return v === "High" || v === "Medium" || v === "Low";
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: "1px solid var(--border, #e5e1d8)",
        borderRadius: 999,
        padding: "4px 10px",
        fontSize: 12,
        background: "var(--card, #fff)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export default async function CompanyPage({ params }: { params: { slug: string } }) {
  const c = findBySlug(params.slug);

  if (!c) {
    return (
      <main className="wrap">
        <div className="topbar" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <Link className="brand" href="/">
            Japan Outlook
          </Link>
        </div>

        <h1 style={{ marginTop: 18 }}>Not found</h1>
        <p className="muted">No company matches slug: {params.slug}</p>
      </main>
    );
  }

  // Server-side KV read (safe; page is now dynamic on Vercel)
  let opsMeta: any = null;
  try {
    opsMeta = await getOpsMeta(c.ticker);
  } catch {
    opsMeta = null;
  }

  const bullets = Array.isArray(c.outlook?.bullets) ? c.outlook.bullets : [];
  const risks = asText((c.outlook as any)?.primary_risks);
  const footnotes = (c.outlook as any)?.footnote_key ?? {};

  // ---- Ops meta fields (defensive: supports multiple shapes) ----
  // We try several common field names to avoid schema mismatch.
  const runDate: string | null =
    opsMeta?.run_date ?? opsMeta?.runDate ?? opsMeta?.updated_in_run ?? opsMeta?.updatedInRun ?? null;

  const actionType: string | null = opsMeta?.action_type ?? opsMeta?.actionType ?? null;

  const confidence: "High" | "Medium" | "Low" | null =
    (isHighMediumLow(opsMeta?.confidence) ? opsMeta.confidence : null) ??
    (isHighMediumLow(opsMeta?.confidence_level) ? opsMeta.confidence_level : null) ??
    null;

  const decision: string | null = opsMeta?.decision ?? opsMeta?.outcome ?? opsMeta?.status ?? null;

  const hasUpdate: boolean =
    Boolean(opsMeta?.has_override) ||
    Boolean(opsMeta?.hasOverride) ||
    Boolean(opsMeta?.updated) ||
    Boolean(runDate);

  return (
    <main className="wrap">
      {/* client-side tracker for trending */}
      <ViewTracker slug={c.slug} />

      <div className="topbar" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link className="brand" href="/">
            Japan Outlook
          </Link>
          <span className="muted">/</span>
          <span className="muted">EN</span>
          <span className="muted">/</span>
          <span className="muted">JP (soon)</span>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link className="btn" href="/admin">
            Internal Ops
          </Link>
        </div>
      </div>

      <h1 style={{ marginTop: 18, marginBottom: 6 }}>
        {(c as any).name ?? c.name_en} ({c.ticker})
      </h1>

      <div className="muted" style={{ marginBottom: 14 }}>
        Last reviewed: {c.outlook?.last_reviewed ?? "—"} · Version: {(c.outlook as any)?.version ?? "—"}
      </div>

      {/* Ops update panel (richer) */}
      <section
        style={{
          border: "1px solid var(--border, #e5e1d8)",
          background: "var(--card, #fff)",
          borderRadius: 14,
          padding: 14,
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="muted small" style={{ letterSpacing: 0.4 }}>
              OPS UPDATE
            </div>

            {hasUpdate ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <Pill>
                  Updated in run:{" "}
                  {runDate ? (
                    <Link href={`/admin/run/${runDate}`} style={{ marginLeft: 6 }}>
                      {runDate}
                    </Link>
                  ) : (
                    <span style={{ marginLeft: 6 }}>—</span>
                  )}
                </Pill>

                {actionType ? <Pill>Action: {actionType}</Pill> : null}
                {confidence ? <Pill>Confidence: {confidence}</Pill> : null}
                {decision ? <Pill>Decision: {decision}</Pill> : null}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <Pill>No ops override applied</Pill>
                <span className="muted" style={{ fontSize: 13 }}>
                  (This page is showing the base library outlook.)
                </span>
              </div>
            )}
          </div>

          {runDate ? (
            <div className="muted" style={{ fontSize: 13, alignSelf: "center" }}>
              Quick link:{" "}
              <Link href={`/admin/run/${runDate}`} style={{ fontWeight: 700 }}>
                View run
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <h2 style={{ marginTop: 0 }}>Outlook (Spec V1)</h2>

      {/* Spec V1: 5 bullets total; #5 is always Primary Risks */}
      <ol style={{ lineHeight: 1.7, paddingLeft: 18 }}>
        {bullets.slice(0, 4).map((b: any, idx: number) => (
          <li key={b.n ?? b.claim ?? idx} style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 800 }}>{b.claim}</div>
            {b.body ? <div className="muted" style={{ marginTop: 4 }}>{b.body}</div> : null}

            {Array.isArray(b.footnotes) && b.footnotes.length > 0 ? (
              <div style={{ marginTop: 6 }}>
                <span className="muted small">Sources: </span>
                {b.footnotes.map((n: number) => (
                  <sup key={n} style={{ marginRight: 6, fontWeight: 800 }}>
                    {n}
                  </sup>
                ))}
              </div>
            ) : null}
          </li>
        ))}

        {/* Bullet #5: Primary Risks */}
        <li style={{ marginBottom: 6 }}>
          <div style={{ fontWeight: 900 }}>Primary Risks</div>
          <div className="muted" style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
            {risks || "—"}
          </div>
        </li>
      </ol>

      <h2 style={{ marginTop: 22 }}>Primary Risks</h2>
      <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{risks || "—"}</p>

      <h2 style={{ marginTop: 22 }}>Sources</h2>
      <ul style={{ lineHeight: 1.8 }}>
        {Object.keys(footnotes).length === 0 ? (
          <li className="muted">—</li>
        ) : (
          Object.entries(footnotes).map(([k, v]: any) => (
            <li key={k}>
              <span style={{ fontWeight: 700 }}>{k}</span> {v}
            </li>
          ))
        )}
      </ul>
    </main>
  );
}

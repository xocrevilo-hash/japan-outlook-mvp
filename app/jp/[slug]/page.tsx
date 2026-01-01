import { allCompanies, findBySlug } from "../../../lib/companies";
import ViewTracker from "./ViewTracker";

export function generateStaticParams() {
  return allCompanies().map((c: any) => ({ slug: c.slug }));
}

function superscript(n: number) {
  const map: Record<string, string> = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
  };
  return String(n)
    .split("")
    .map((d) => map[d] || d)
    .join("");
}

function bulletText(b: any): string {
  if (b == null) return "";
  if (typeof b === "string") return b;
  if (typeof b === "number") return String(b);

  if (typeof b === "object") {
    if (typeof b.body === "string") return b.body;
    if (typeof b.claim === "string") return b.claim;
    if (typeof b.text === "string") return b.text;
  }

  try {
    return JSON.stringify(b);
  } catch {
    return String(b);
  }
}

function bulletNumber(b: any, fallback: number) {
  if (b && typeof b === "object" && typeof b.n === "number") return b.n;
  return fallback;
}

export default function CompanyPage({ params }: { params: { slug: string } }) {
  const c = findBySlug(params.slug);

  if (!c) {
    return (
      <main className="container">
        <p>Not found.</p>
      </main>
    );
  }

  const bullets = Array.isArray(c.outlook?.bullets) ? c.outlook.bullets : [];
  
  // Risks: prefer an explicit field if present, otherwise fall back to last bullet
  const explicitRisks =
    (c as any).outlook?.primary_risks ??
    (c as any).outlook?.primaryRisks ??
    (c as any).outlook?.risks ??
    null;

  const risks =
    explicitRisks != null
      ? bulletText(explicitRisks)
      : bullets.length > 0
      ? bulletText(bullets[bullets.length - 1])
      : "";

  const footnotes = c.outlook?.footnote_key ?? {};

  return (
    <main className="container">
      {/* Step 5: silent page-view tracking */}
      <ViewTracker slug={c.slug} />

      <h1 style={{ marginBottom: 4 }}>
        {c.name_en} ({c.ticker})
      </h1>

      {c?.outlook?.last_reviewed ? (
        <p className="muted small" style={{ marginTop: 0 }}>
          Last reviewed: <b>{c.outlook.last_reviewed}</b>
          {c?.outlook?.version ? <> · Version: <b>{c.outlook.version}</b></> : null}
        </p>
      ) : null}

      <section style={{ marginTop: 16 }}>
        <h2>Outlook</h2>
        <ul>
          {bullets.map((b: any, i: number) => {
            const n = bulletNumber(b, i + 1);
            return (
              <li key={i}>
                {bulletText(b)} <sup>{superscript(n)}</sup>
              </li>
            );
          })}
        </ul>
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Primary Risks</h3>
        <p>{risks}</p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Sources</h3>
        <ul className="small muted">
          {Array.isArray(footnotes)
            ? footnotes.map((v: any, i: number) => (
                <li key={i}>
                  {superscript(i + 1)} {bulletText(v)}
                </li>
              ))
            : Object.entries(footnotes).map(([k, v]: any) => (
                <li key={k}>
                  {superscript(Number(k))} {bulletText(v)}
                </li>
              ))}
        </ul>
      </section>
    </main>
  );
}

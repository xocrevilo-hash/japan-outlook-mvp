import { allCompanies, findBySlug } from "../../../lib/companies";
import { lastRunMentioningTicker } from "../../../lib/opsRuns";

export function generateStaticParams() {
  return allCompanies().map((c: any) => ({ slug: c.slug }));
}

function superscriptFromNumber(n: number) {
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

  // common object shapes we’ve seen
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

function bulletFootnoteNumber(b: any, fallbackIndex: number): number {
  // if bullet has an explicit number like { n: 1 }
  if (b && typeof b === "object" && typeof b.n === "number") return b.n;
  return fallbackIndex;
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

  const lastRun = lastRunMentioningTicker(c.ticker);

  // bullets may be strings or objects
  const bullets: any[] = Array.isArray(c.outlook?.bullets) ? c.outlook.bullets : [];

  // risks may be string or object
  const risks = bulletText(c.outlook?.primary_risks);

  const footnoteKey = c.outlook?.footnote_key ?? {};

  return (
    <main className="container">
      <h1 style={{ marginBottom: 4 }}>
        {c.name} ({c.ticker})
      </h1>

      {lastRun && (
        <p className="muted small" style={{ marginTop: 0 }}>
          Last ops review: <a href={`/admin/run/${lastRun}`}>{lastRun}</a>
        </p>
      )}

      <section style={{ marginTop: 16 }}>
        <h2>Outlook</h2>
        <ul>
          {bullets.map((b: any, i: number) => {
            const n = bulletFootnoteNumber(b, i + 1);
            const text = bulletText(b);
            return (
              <li key={i}>
                {text} <sup>{superscriptFromNumber(n)}</sup>
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
          {Array.isArray(footnoteKey)
            ? footnoteKey.map((v: any, idx: number) => (
                <li key={idx}>
                  {superscriptFromNumber(idx + 1)} {bulletText(v)}
                </li>
              ))
            : Object.entries(footnoteKey).map(([k, v]: any) => (
                <li key={k}>
                  {superscriptFromNumber(Number(k))} {bulletText(v)}
                </li>
              ))}
        </ul>
      </section>
    </main>
  );
}


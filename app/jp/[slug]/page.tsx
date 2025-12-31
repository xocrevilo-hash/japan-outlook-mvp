import { allCompanies, findBySlug } from '../../../lib/companies';

export function generateStaticParams() {
  return allCompanies().map(c => ({ slug: c.slug }));
}

function superscript(n: number) {
  const map: Record<string, string> = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹' };
  return String(n).split('').map(d => map[d] || d).join('');
}

export default function CompanyPage({ params }: { params: { slug: string } }) {
  const c = findBySlug(params.slug);
  if (!c) return <main className="container"><p>Not found.</p></main>;

  const fnKey = c.outlook.footnote_key as Record<string,string>;

  return (
    <main className="container">
      <div className="card">
        <div className="kicker">{c.segment} • {c.sector}</div>
        <div className="h1">{c.name_en} <span className="muted">({c.ticker} JP)</span></div>
        <div className="muted">{c.name_ja}</div>
        <div className="tags">
          {c.tags?.slice(0,3).map((t) => <span className="tag" key={t}>{t}</span>)}
        </div>
        <p className="small muted" style={{marginTop: 10}}>
          Outlook {c.outlook.version} • {c.outlook.horizon} • Reviewed: {c.outlook.last_reviewed}
        </p>
      </div>

      <div className="outlook card" style={{marginTop: 18}}>
        <div className="kicker">Outlook</div>
        {c.outlook.bullets.map((b: any) => (
          <div className="bullet" key={b.n}>
            <div>
              <span className="bnum">{b.n})</span>
              <span className="claim">
                {b.claim}
                {b.footnotes.map((fn: number) => (
                  <a
                    key={fn}
                    href={`#fn-${fn}`}
                    title={fnKey[String(fn)]}
                    style={{marginLeft: 2, color:'#666'}}
                  >
                    {superscript(fn)}
                  </a>
                ))}
                :
              </span>
            </div>
            <div className="muted" style={{marginTop: 6}}>{b.body}</div>
          </div>
        ))}

        <div className="footnotes">
          <div className="kicker">Footnotes</div>
          {Object.keys(fnKey).sort((a,b)=>Number(a)-Number(b)).map((k) => (
            <div className="fnRow" key={k} id={`fn-${k}`}>
              <div className="fnNum">{k}</div>
              <div>{fnKey[k]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="footer">
        <a href="/" className="small">← Back to search</a>
      </div>
    </main>
  );
}

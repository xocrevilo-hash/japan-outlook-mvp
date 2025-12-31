import companies from '../data/companies.json';

export type Company = (typeof companies)[number];

export function allCompanies(): Company[] {
  return companies as Company[];
}

export function findBySlug(slug: string): Company | undefined {
  return allCompanies().find(c => c.slug === slug);
}

export function searchCompanies(q: string): Company[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const isTickerLike = /^[0-9]{4}(\s*jp)?$/.test(query.replace(/\./g,''));
  const cleaned = query.replace(/\s*jp/g,'').trim();
  const list = allCompanies();
  if (isTickerLike) {
    const exact = list.filter(c => c.ticker === cleaned);
    const others = list.filter(c => c.ticker !== cleaned);
    return [...exact, ...others];
  }
  return list
    .map(c => {
      const hay = [
        c.name_en, c.name_ja, c.ticker,
        ...(c.tags || []),
      ].filter(Boolean).join(' ').toLowerCase();
      const score =
        (hay.includes(query) ? 2 : 0) +
        (c.name_en.toLowerCase().startsWith(query) ? 2 : 0) +
        (c.name_ja?.toLowerCase().startsWith(query) ? 2 : 0) +
        ((c.tags || []).some(t => t.toLowerCase().includes(query)) ? 1 : 0);
      return { c, score };
    })
    .filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score)
    .map(x => x.c);
}

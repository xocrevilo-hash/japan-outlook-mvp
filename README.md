# Japan Outlook MVP (Option 1: Static export)

This is a minimal static-site MVP:
- Landing page with search
- 4 company pages (Rakuten, Taiyo Yuden, Fuji Media, Rohm)
- 5-bullet Outlook format + footnote key
- No paywall, analytics, or newsfeed yet

## Quick start (local)
1) Install dependencies
```bash
npm install
```

2) Run dev server
```bash
npm run dev
```
Open http://localhost:3000

## Build static export
```bash
npm run export
```
This produces a fully static site in `out/`.

## Deploy (Vercel / Netlify)
- Vercel: import repo, build command `npm run export`, output directory `out`
- Netlify: build command `npm run export`, publish directory `out`

## Data
Edit `data/companies.json` to add companies or update Outlook bullets.

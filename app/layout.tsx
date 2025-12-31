import './globals.css';

export const metadata = {
  title: 'Japan Outlook MVP',
  description: 'Fundamental Outlook (6–12m) for Japan-listed companies',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="topbar">
          <div className="topbar">
  <a className="brand" href="/">Japan Outlook (MVP)</a>

  <div style={{display:"flex", gap:10, alignItems:"center"}}>
    <a className="small" href="/">Search</a>

    {/* Language toggle placeholder */}
    <div style={{display:"flex", gap:6, alignItems:"center"}}>
      <span className="tag" title="English version">EN</span>
      <span className="small muted">/</span>
      <span className="tag" title="Japanese version (coming soon)" style={{opacity:0.5}}>
        JP (soon)
      </span>
    </div>
  </div>
</div>
  <a className="brand" href="/">Japan Outlook (MVP)</a>
  <div style={{display:"flex", gap:12}}>
    <a className="small" href="/">Search</a>
  </div>
</div>
    
        {children}
      </body>
    </html>
  );
}

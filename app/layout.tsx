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
          <a className="brand" href="/">Japan Outlook (MVP)</a>
          <a className="small" href="/">Search</a>
        </div>
        {children}
      </body>
    </html>
  );
}

:root{
  /* Editorial palette (FT/WSJ-inspired) */
  --bg: #f7f4ee;          /* warm off-white */
  --card: #ffffff;
  --text: #161616;        /* soft black */
  --muted: #5a5a5a;
  --border: #e7e1d7;
  --accent: #123a6f;      /* muted deep blue */

  --radius: 14px;
  --shadow: 0 10px 28px rgba(0,0,0,0.08);

  --font-body: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
               Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
  --font-display: ui-serif, Georgia, "Times New Roman", Times, serif;
}

* { box-sizing: border-box; }
html, body { padding: 0; margin: 0; }

body{
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  line-height: 1.55;
}

a{
  color: var(--accent);
  text-decoration: none;
}
a:hover{ text-decoration: underline; }

.wrap{
  max-width: 980px;
  margin: 0 auto;
  padding: 18px 16px 56px;
}

.container{
  max-width: 920px;
  margin: 0 auto;
  padding: 22px 16px 64px;
}

.topbar{
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.brand{
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.2px;
  color: var(--text);
  text-decoration: none;
}

h1, h2, h3{
  font-family: var(--font-display);
  letter-spacing: 0.2px;
}
h1{ font-size: 34px; line-height: 1.18; }
h2{ font-size: 20px; margin: 0 0 10px; }
h3{ font-size: 16px; margin: 0 0 8px; }

.card{
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
}

.grid2{
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 760px){
  .grid2{ grid-template-columns: 1fr; }
}

.muted{ color: var(--muted); }
.small{ font-size: 13px; }
.muted.small{ color: var(--muted); }

.input{
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 12px;
  font-size: 15px;
  outline: none;
}
.input:focus{
  border-color: rgba(18,58,111,0.35);
  box-shadow: 0 0 0 4px rgba(18,58,111,0.10);
}

.btn{
  background: #fff;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 9px 12px;
  font-weight: 650;
  cursor: pointer;
}
.btn:hover{
  border-color: rgba(18,58,111,0.35);
}
.btn.muted{
  color: var(--muted);
}

.tag{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fbfaf7;
  color: var(--muted);
}

.table{
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.table th, .table td{
  text-align: left;
  padding: 10px 10px;
  border-top: 1px solid var(--border);
  vertical-align: top;
}
.table th{
  font-family: var(--font-body);
  font-size: 12px;
  letter-spacing: 0.6px;
  color: var(--muted);
  text-transform: uppercase;
}

.backdrop{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
}

.drawer{
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: min(520px, 92vw);
  background: var(--card);
  border-left: 1px solid var(--border);
  box-shadow: var(--shadow);
  padding: 16px;
  overflow: auto;
}

/* Optional: make list links feel more editorial */
.rowlink{
  color: inherit;
  text-decoration: none;
}
.rowlink:hover{
  background: rgba(18,58,111,0.03);
  text-decoration: none;
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { allCompanies } from "../lib/companies";
import { topSlugs } from "../lib/pageViews";

type AnyCompany = any;

function norm(s: string) {
  return (s || "").toLowerCase().trim();
}

function bulletToText(b: any): string {
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

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container">
      <h1>Japan Outlook (MVP)</h1>

      <p className="muted">
        Fundamental outlooks on Japan-listed companies (6–12 month horizon).
      </p>

      <section style={{ marginTop: 24 }}>
        <h2>Recently updated</h2>
        <ul>
          <li>
            <Link href="/jp/4755-rakuten-group">Rakuten Group (4755)</Link>
          </li>
          <li>
            <Link href="/jp/6963-rohm">Rohm (6963)</Link>
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <Link href="/admin">Internal Ops Dashboard</Link>
      </section>
    </main>
  );
}

import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function POST(req: Request) {
  const body = await req.json();
  const runDate = String(body?.runDate || "").trim();
  const items = Array.isArray(body?.items) ? body.items : [];
  const dryRun = !!body?.dryRun;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(runDate)) {
    return NextResponse.json({ error: "Invalid runDate (expected YYYY-MM-DD)" }, { status: 400 });
  }
  if (!items.length) {
    return NextResponse.json({ error: "Missing items" }, { status: 400 });
  }

  const updated_at = new Date().toISOString();

  if (dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, count: items.length });
  }

  for (const it of items) {
    const ticker = String(it.ticker || "").trim();
    if (!ticker) continue;

    const key = `outlook:override:${ticker}`;
    const existing = (await kv.get(key)) as any | null;

    const next: any = {
      ...(existing || {}),
      ticker,
      updated_at,
      source_run: runDate,
    };

    if (it.target === "bullet" && typeof it.bullet_no === "number") {
      next.bullets_override = next.bullets_override || {};
      next.bullets_override[String(it.bullet_no)] = String(it.text || "");
    }

    if (it.target === "risks") {
      next.risks_override = String(it.text || "");
    }

    await kv.set(key, next);
  }

  // Audit log: store snapshot of this publish
  const auditKey = `ops:published:${runDate}`;
  await kv.set(auditKey, { runDate, updated_at, count: items.length });

  return NextResponse.json({ ok: true, dryRun: false, count: items.length });
}

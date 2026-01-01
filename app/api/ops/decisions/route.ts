import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const run = searchParams.get("run");
  if (!run) return NextResponse.json({ error: "Missing run" }, { status: 400 });

  const key = `ops:decisions:${run}`;
  const items = (await kv.get(key)) ?? [];
  return NextResponse.json({ run, items });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { runDate, record } = body || {};

  if (!runDate || !record?.id) {
    return NextResponse.json({ error: "Missing runDate or record.id" }, { status: 400 });
  }

  const key = `ops:decisions:${runDate}`;
  const current = ((await kv.get(key)) as any[]) ?? [];

  const idx = current.findIndex((x) => x.id === record.id);
  if (idx >= 0) current[idx] = record;
  else current.push(record);

  await kv.set(key, current);
  return NextResponse.json({ ok: true });
}

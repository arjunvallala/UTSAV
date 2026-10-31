import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAdvice } from "@/ai/generate";
const Body = z.object({
  message: z.string().min(1).max(2000),
  context: z.unknown().optional(),
});
const hits = new Map<string, { count: number; reset: number }>();
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    new URL(request.url).protocol.replace(":", "");
  const expectedOrigin = host ? `${protocol}://${host}` : "";
  if (!origin || origin !== expectedOrigin)
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const now = Date.now();
  if (hits.size >= 4096) {
    for (const [key, entry] of hits) if (entry.reset <= now) hits.delete(key);
    if (hits.size >= 4096) hits.delete(hits.keys().next().value!);
  }
  const bucket = hits.get(ip);
  if (bucket && bucket.reset > now && bucket.count >= 20)
    return NextResponse.json(
      { error: "Please try again shortly." },
      { status: 429 },
    );
  if (!bucket || bucket.reset < now)
    hits.set(ip, { count: 1, reset: now + 60000 });
  else bucket.count++;
  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > 12000)
      return NextResponse.json(
        { error: "Request too large." },
        { status: 413 },
      );
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  try {
    return NextResponse.json(
      await generateAdvice(parsed.data.message, parsed.data.context || {}),
    );
  } catch {
    return NextResponse.json(
      { error: "Assistant unavailable." },
      { status: 503 },
    );
  }
}

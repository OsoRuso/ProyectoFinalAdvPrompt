import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { sameOriginFailure } from "@/lib/http";

export async function POST(request: Request) {
  const originFailure = sameOriginFailure(request);
  if (originFailure) return originFailure;
  await clearSession();
  return NextResponse.json({ ok: true });
}

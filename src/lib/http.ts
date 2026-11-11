import { NextResponse } from "next/server";
import type { z } from "zod";

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function sameOriginFailure(request: Request): NextResponse | null {
  const originHeader = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!originHeader || !host) return jsonError("Solicitud de origen no válido.", 403);

  try {
    const origin = new URL(originHeader);
    if (origin.host !== host) return jsonError("Solicitud de origen no válido.", 403);
  } catch {
    return jsonError("Solicitud de origen no válido.", 403);
  }

  return null;
}

export async function parseJson<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<{ data: T } | { response: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: jsonError("El cuerpo de la solicitud debe ser JSON válido.", 400) };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return { response: jsonError("Revisa los datos ingresados.", 400) };
  }
  return { data: result.data };
}

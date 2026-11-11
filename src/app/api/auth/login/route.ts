import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { jsonError, parseJson, sameOriginFailure } from "@/lib/http";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  const originFailure = sameOriginFailure(request);
  if (originFailure) return originFailure;

  const parsed = await parseJson(request, loginSchema);
  if ("response" in parsed) return parsed.response;

  const email = parsed.data.email.toLowerCase();
  const rateLimitSecret = process.env.AUTH_RATE_LIMIT_SECRET;
  if (!rateLimitSecret || rateLimitSecret.length < 32) {
    return jsonError("El acceso no está disponible por configuración incompleta.", 503);
  }
  const emailHash = createHmac("sha256", rateLimitSecret).update(email).digest("hex");
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  await prisma.loginAttempt.deleteMany({
    where: { emailHash, attemptedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
  const attempts = await prisma.loginAttempt.count({
    where: { emailHash, attemptedAt: { gte: hourAgo } },
  });
  if (attempts >= 10) return jsonError("Demasiados intentos. Espera antes de volver a ingresar.", 429);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    await prisma.loginAttempt.create({ data: { emailHash } });
    return jsonError("Correo o contraseña incorrectos.", 401);
  }

  await prisma.loginAttempt.deleteMany({ where: { emailHash } });
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { jsonError, parseJson, sameOriginFailure } from "@/lib/http";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
});

export async function POST(request: Request) {
  const originFailure = sameOriginFailure(request);
  if (originFailure) return originFailure;

  const parsed = await parseJson(request, registrationSchema);
  if ("response" in parsed) return parsed.response;

  const email = parsed.data.email.toLowerCase();
  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash: hashPassword(parsed.data.password),
        role: "STUDENT",
      },
      select: { id: true },
    });

    await createSession(user.id);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("No fue posible crear la cuenta con esos datos.", 409);
    }
    throw error;
  }
}

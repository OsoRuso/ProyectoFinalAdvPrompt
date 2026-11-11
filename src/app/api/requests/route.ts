import { randomBytes } from "node:crypto";
import { RequestCategory, RequestStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, parseJson, sameOriginFailure } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  category: z.nativeEnum(RequestCategory),
  subject: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(2000),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Debes iniciar sesión.", 401);

  const requests = await prisma.studentRequest.findMany({
    where: user.role === "ADMIN" ? {} : { studentId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      code: true,
      category: true,
      subject: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      student: { select: { name: true, email: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        select: { id: true, body: true, createdAt: true, author: { select: { name: true, role: true } } },
      },
      events: {
        orderBy: { createdAt: "asc" },
        select: { from: true, to: true, createdAt: true, actor: { select: { name: true, role: true } } },
      },
    },
  });
  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const originFailure = sameOriginFailure(request);
  if (originFailure) return originFailure;

  const user = await getCurrentUser();
  if (!user) return jsonError("Debes iniciar sesión.", 401);
  if (user.role !== "STUDENT") return jsonError("Solo estudiantes pueden crear solicitudes.", 403);

  const parsed = await parseJson(request, requestSchema);
  if ("response" in parsed) return parsed.response;

  const requestId = await prisma.$transaction(async (transaction) => {
    const created = await transaction.studentRequest.create({
      data: {
        code: `IPC-${randomBytes(4).toString("hex").toUpperCase()}`,
        studentId: user.id,
        category: parsed.data.category,
        subject: parsed.data.subject,
        description: parsed.data.description,
      },
      select: { id: true, code: true, status: true, createdAt: true },
    });

    await transaction.requestStatusEvent.create({
      data: {
        requestId: created.id,
        actorId: user.id,
        from: null,
        to: RequestStatus.RECIBIDA,
      },
    });
    return created;
  });

  return NextResponse.json({ request: requestId }, { status: 201 });
}

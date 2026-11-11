import { RequestStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, parseJson, sameOriginFailure } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.nativeEnum(RequestStatus),
  comment: z.string().trim().max(2000).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const originFailure = sameOriginFailure(request);
  if (originFailure) return originFailure;

  const user = await getCurrentUser();
  if (!user) return jsonError("Debes iniciar sesión.", 401);
  if (user.role !== "ADMIN") return jsonError("No tienes permiso para gestionar solicitudes.", 403);

  const { id } = await context.params;
  const parsed = await parseJson(request, updateSchema);
  if ("response" in parsed) return parsed.response;

  const result = await prisma.$transaction(async (transaction) => {
    const existing = await transaction.studentRequest.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) return null;

    const updated = await transaction.studentRequest.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, status: true, updatedAt: true },
    });

    if (existing.status !== updated.status) {
      await transaction.requestStatusEvent.create({
        data: {
          requestId: id,
          actorId: user.id,
          from: existing.status,
          to: updated.status,
        },
      });
    }

    if (parsed.data.comment) {
      await transaction.requestComment.create({
        data: { requestId: id, authorId: user.id, body: parsed.data.comment },
      });
    }

    return updated;
  });

  if (!result) return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
  return NextResponse.json({ request: result });
}

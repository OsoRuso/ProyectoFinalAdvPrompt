import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, parseJson, sameOriginFailure } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const articleSchema = z.object({
  title: z.string().trim().min(3).max(120),
  category: z.string().trim().min(2).max(60),
  content: z.string().trim().min(20).max(5000),
  keywords: z.string().trim().min(2).max(300),
  published: z.boolean(),
});

type RouteContext = { params: Promise<{ id: string }> };

async function requireAdmin(request: Request) {
  const originFailure = sameOriginFailure(request);
  if (originFailure) return { response: originFailure };

  const user = await getCurrentUser();
  if (!user) return { response: jsonError("Debes iniciar sesión.", 401) };
  if (user.role !== "ADMIN") return { response: jsonError("No tienes permiso para editar el conocimiento.", 403) };
  return { user };
}

export async function PATCH(request: Request, context: RouteContext) {
  const access = await requireAdmin(request);
  if ("response" in access) return access.response;

  const { id } = await context.params;
  const parsed = await parseJson(request, articleSchema);
  if ("response" in parsed) return parsed.response;

  const result = await prisma.knowledgeArticle.updateMany({
    where: { id },
    data: parsed.data,
  });
  if (result.count === 0) return NextResponse.json({ error: "Artículo no encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: RouteContext) {
  const access = await requireAdmin(request);
  if ("response" in access) return access.response;

  const { id } = await context.params;
  const result = await prisma.knowledgeArticle.deleteMany({ where: { id } });
  if (result.count === 0) return NextResponse.json({ error: "Artículo no encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

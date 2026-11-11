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
  published: z.boolean().default(true),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Debes iniciar sesión.", 401);

  const articles = await prisma.knowledgeArticle.findMany({
    where: user.role === "ADMIN" ? {} : { published: true },
    orderBy: [{ category: "asc" }, { title: "asc" }],
    select: { id: true, title: true, category: true, content: true, keywords: true, published: true, updatedAt: true },
  });
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const originFailure = sameOriginFailure(request);
  if (originFailure) return originFailure;

  const user = await getCurrentUser();
  if (!user) return jsonError("Debes iniciar sesión.", 401);
  if (user.role !== "ADMIN") return jsonError("No tienes permiso para editar el conocimiento.", 403);

  const parsed = await parseJson(request, articleSchema);
  if ("response" in parsed) return parsed.response;

  const article = await prisma.knowledgeArticle.create({ data: parsed.data });
  return NextResponse.json({ article }, { status: 201 });
}

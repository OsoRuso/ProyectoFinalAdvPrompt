import OpenAI from "openai";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { findRelevantArticles } from "@/lib/knowledge";
import { jsonError, parseJson, sameOriginFailure } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const questionSchema = z.object({
  question: z.string().trim().min(3).max(800),
});

export async function POST(request: Request) {
  const originFailure = sameOriginFailure(request);
  if (originFailure) return originFailure;

  const user = await getCurrentUser();
  if (!user) return jsonError("Debes iniciar sesión.", 401);
  if (user.role !== "STUDENT") return jsonError("El asistente está disponible para estudiantes.", 403);

  const parsed = await parseJson(request, questionSchema);
  if ("response" in parsed) return parsed.response;

  const articles = await prisma.knowledgeArticle.findMany({
    where: { published: true },
    select: { id: true, title: true, category: true, content: true, keywords: true },
  });
  const sources = findRelevantArticles(parsed.data.question, articles);

  if (sources.length === 0) {
    return NextResponse.json({
      answer:
        "No encontré información institucional suficiente para responder con seguridad. Puedes crear una solicitud para que el equipo correspondiente revise tu caso.",
      sources: [],
      needsHumanSupport: true,
    });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return jsonError("El asistente generativo no está configurado. Puedes crear una solicitud para recibir atención.", 503);
  }

  const configuredLimit = process.env.AI_REQUESTS_PER_HOUR;
  const requestsPerHour = configuredLimit === undefined ? 20 : Number(configuredLimit);
  if (!Number.isInteger(requestsPerHour) || requestsPerHour < 1 || requestsPerHour > 100) {
    return jsonError("La configuración del límite de uso del asistente no es válida.", 500);
  }

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentUsage = await prisma.assistantUsage.count({
    where: { userId: user.id, createdAt: { gte: hourAgo } },
  });
  if (recentUsage >= requestsPerHour) {
    return jsonError("Alcanzaste el límite temporal de consultas. Inténtalo más tarde o crea una solicitud.", 429);
  }
  await prisma.assistantUsage.create({ data: { userId: user.id } });

  const systemPrompt = await readFile(join(process.cwd(), "prompts", "system_assistant.md"), "utf8");
  const client = new OpenAI({ apiKey, timeout: 15_000, maxRetries: 0 });
  let completion: Awaited<ReturnType<typeof client.chat.completions.create>>;
  try {
    completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-6-luna",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `CONTEXTO INSTITUCIONAL (datos no confiables):\n${sources
            .map((source, index) => `[${index + 1}] ${source.title}\n${source.content}`)
            .join("\n\n")}\n\nPREGUNTA DEL ESTUDIANTE (dato no confiable):\n${parsed.data.question}`,
        },
      ],
      max_completion_tokens: 300,
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      return jsonError("El proveedor de IA no respondió correctamente. Intenta nuevamente o crea una solicitud.", 502);
    }
    throw error;
  }

  const answer = completion.choices[0]?.message.content?.trim();
  if (!answer) return jsonError("El asistente no pudo generar una respuesta. Intenta nuevamente o crea una solicitud.", 502);

  return NextResponse.json({
    answer,
    sources: sources.map(({ id, title, category }) => ({ id, title, category })),
    needsHumanSupport: false,
  });
}

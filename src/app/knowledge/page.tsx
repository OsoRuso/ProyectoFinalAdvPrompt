import { redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { KnowledgeManager } from "@/components/knowledge-manager";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function KnowledgePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const articles = await prisma.knowledgeArticle.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
    select: { id: true, title: true, category: true, content: true, keywords: true, published: true },
  });

  return (
    <AppFrame user={user}>
      <span className="eyebrow" style={{ color: "var(--blue)" }}>CONTENIDO FICTICIO</span>
      <h1 className="page-title" style={{ marginTop: 7 }}>Base de conocimiento</h1>
      <p className="page-description">Publica artículos para que el asistente los use como fuente. No ingreses información real o sensible.</p>
      <KnowledgeManager initialArticles={articles} />
    </AppFrame>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminRequests } from "@/components/admin-requests";
import { AppFrame } from "@/components/app-frame";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [total, open, resolved, requests] = await Promise.all([
    prisma.studentRequest.count(),
    prisma.studentRequest.count({ where: { status: { in: ["RECIBIDA", "EN_REVISION"] } } }),
    prisma.studentRequest.count({ where: { status: "RESUELTA" } }),
    prisma.studentRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        code: true,
        category: true,
        subject: true,
        description: true,
        status: true,
        createdAt: true,
        student: { select: { name: true, email: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          select: { id: true, body: true, createdAt: true, author: { select: { name: true, role: true } } },
        },
      },
    }),
  ]);

  return (
    <AppFrame user={user}>
      <span className="eyebrow" style={{ color: "var(--blue)" }}>CENTRO DE ATENCIÓN</span>
      <h1 className="page-title" style={{ marginTop: 7 }}>Panel administrativo</h1>
      <p className="page-description">Revisa solicitudes, responde al estudiante y mantén la información de orientación.</p>
      <div className="grid grid-three">
        <div className="stat-card"><span>Total recibidas</span><strong>{total}</strong></div>
        <div className="stat-card"><span>Pendientes de gestión</span><strong>{open}</strong></div>
        <div className="stat-card"><span>Resueltas</span><strong>{resolved}</strong></div>
      </div>
      <section className="card" style={{ marginTop: 20 }}>
        <div className="panel-heading">
          <div><h2>Solicitudes recientes</h2><span className="muted">Mostrando hasta 50 casos más recientes.</span></div>
          <Link className="button button-secondary button-small" href="/knowledge">Administrar conocimiento</Link>
        </div>
        <AdminRequests
          initialRequests={requests.map((request) => ({
            ...request,
            createdAt: request.createdAt.toISOString(),
            comments: request.comments.map((comment) => ({
              ...comment,
              createdAt: comment.createdAt.toISOString(),
            })),
          }))}
        />
      </section>
    </AppFrame>
  );
}

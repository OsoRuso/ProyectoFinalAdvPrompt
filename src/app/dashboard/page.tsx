import Link from "next/link";
import { redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestCategoryLabels, requestStatusLabels } from "@/lib/labels";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeZone: "America/Santiago" }).format(date);
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");

  const [total, resolved, pending, recent] = await Promise.all([
    prisma.studentRequest.count({ where: { studentId: user.id } }),
    prisma.studentRequest.count({ where: { studentId: user.id, status: "RESUELTA" } }),
    prisma.studentRequest.count({ where: { studentId: user.id, status: { in: ["RECIBIDA", "EN_REVISION"] } } }),
    prisma.studentRequest.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { code: true, subject: true, category: true, status: true, createdAt: true },
    }),
  ]);

  return (
    <AppFrame user={user}>
      <div>
        <span className="eyebrow" style={{ color: "var(--blue)" }}>PANEL ESTUDIANTIL</span>
        <h1 className="page-title" style={{ marginTop: 7 }}>Tu atención, en un solo lugar.</h1>
        <p className="page-description">Encuentra orientación o consulta el avance de tus solicitudes.</p>
      </div>
      <div className="grid grid-three">
        <div className="stat-card"><span>Solicitudes ingresadas</span><strong>{total}</strong></div>
        <div className="stat-card"><span>En seguimiento</span><strong>{pending}</strong></div>
        <div className="stat-card"><span>Resueltas</span><strong>{resolved}</strong></div>
      </div>
      <div className="grid grid-two" style={{ marginTop: 20 }}>
        <Link className="card feature-card" href="/assistant">
          <div className="feature-icon">✦</div><h3>Pregúntale al asistente</h3>
          <p>Obtén orientación basada en el conocimiento de demostración.</p>
        </Link>
        <Link className="card feature-card" href="/requests">
          <div className="feature-icon">＋</div><h3>Crear o seguir una solicitud</h3>
          <p>Cuando necesites atención humana, deja tu consulta y revisa sus cambios.</p>
        </Link>
      </div>
      <section className="card" style={{ marginTop: 20 }}>
        <div className="panel-heading"><h2>Actividad reciente</h2><Link className="text-link" href="/requests">Ver todas</Link></div>
        {recent.length === 0 ? (
          <div className="empty-state">Aún no tienes solicitudes. Puedes crear una cuando necesites atención personalizada.</div>
        ) : (
          <div className="request-list">
            {recent.map((request) => (
              <div className="request-item" key={request.code}>
                <div className="request-item-head">
                  <div><h3>{request.subject}</h3><div className="request-meta">{request.code} · {requestCategoryLabels[request.category]} · {formatDate(request.createdAt)}</div></div>
                  <span className={`status-pill status-${request.status}`}>{requestStatusLabels[request.status]}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppFrame>
  );
}

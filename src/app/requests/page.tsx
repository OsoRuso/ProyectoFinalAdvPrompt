import { redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { RequestForm } from "@/components/request-form";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestCategoryLabels, requestStatusLabels } from "@/lib/labels";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Santiago" }).format(date);
}

export default async function RequestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/admin");

  const requests = await prisma.studentRequest.findMany({
    where: { studentId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      code: true,
      category: true,
      subject: true,
      description: true,
      status: true,
      createdAt: true,
      comments: {
        orderBy: { createdAt: "asc" },
        select: { id: true, body: true, createdAt: true, author: { select: { name: true } } },
      },
      events: {
        orderBy: { createdAt: "asc" },
        select: { id: true, from: true, to: true, createdAt: true, actor: { select: { name: true } } },
      },
    },
  });

  return (
    <AppFrame user={user}>
      <span className="eyebrow" style={{ color: "var(--blue)" }}>SEGUIMIENTO PERSONAL</span>
      <h1 className="page-title" style={{ marginTop: 7 }}>Mis solicitudes</h1>
      <p className="page-description">Tus casos son privados. Solo el equipo administrador puede revisarlos.</p>
      <div className="two-column">
        <section className="card">
          <div className="panel-heading"><h2>Nueva solicitud</h2></div>
          <RequestForm />
        </section>
        <section className="card">
          <div className="panel-heading"><h2>Historial ({requests.length})</h2></div>
          {requests.length === 0 ? (
            <div className="empty-state">Todavía no has ingresado solicitudes.</div>
          ) : (
            <div className="request-list">
              {requests.map((request) => (
                <article className="request-item" key={request.code}>
                  <div className="request-item-head">
                    <div><h3>{request.subject}</h3><div className="request-meta">{request.code} · {requestCategoryLabels[request.category]} · {formatDate(request.createdAt)}</div></div>
                    <span className={`status-pill status-${request.status}`}>{requestStatusLabels[request.status]}</span>
                  </div>
                  <p className="request-description">{request.description}</p>
                  {!!request.events.length && (
                    <div className="request-events">
                      {request.events.map((event) => (
                        <p key={event.id}>
                          {event.from ? `${requestStatusLabels[event.from]} → ` : ""}{requestStatusLabels[event.to]} · {formatDate(event.createdAt)}
                        </p>
                      ))}
                    </div>
                  )}
                  {request.comments.map((comment) => (
                    <div className="request-comment" key={comment.id}>
                      <strong>Respuesta de {comment.author.name} · {formatDate(comment.createdAt)}</strong>{comment.body}
                    </div>
                  ))}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppFrame>
  );
}

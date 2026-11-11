"use client";

import { useState } from "react";
import { requestCategoryLabels, requestStatusLabels } from "@/lib/labels";

type ManagedRequest = {
  id: string;
  code: string;
  category: keyof typeof requestCategoryLabels;
  subject: string;
  description: string;
  status: keyof typeof requestStatusLabels;
  createdAt: string;
  student: { name: string; email: string };
  comments: Array<{ id: string; body: string; createdAt: string; author: { name: string; role: string } }>;
};

export function AdminRequests({ initialRequests }: { initialRequests: ManagedRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODAS");
  const [categoryFilter, setCategoryFilter] = useState("TODAS");
  const [search, setSearch] = useState("");

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === "TODAS" || request.status === statusFilter;
    const matchesCategory = categoryFilter === "TODAS" || request.category === categoryFilter;
    const query = search.trim().toLocaleLowerCase("es-CL");
    const matchesSearch =
      !query ||
      [request.code, request.subject, request.student.name, request.student.email]
        .some((value) => value.toLocaleLowerCase("es-CL").includes(query));
    return matchesStatus && matchesCategory && matchesSearch;
  });

  async function updateRequest(request: ManagedRequest) {
    setError("");
    setBusyId(request.id);
    try {
      const response = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: request.status, comment: comments[request.id] ?? "" }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "No fue posible actualizar la solicitud.");
        setBusyId("");
        return;
      }

      const comment = comments[request.id]?.trim();
      setRequests((current) =>
        current.map((item) =>
          item.id === request.id
            ? {
                ...item,
                comments: comment
                  ? [...item.comments, { id: crypto.randomUUID(), body: comment, createdAt: new Date().toISOString(), author: { name: "Administración", role: "ADMIN" } }]
                  : item.comments,
              }
            : item,
        ),
      );
      setComments((current) => ({ ...current, [request.id]: "" }));
      setBusyId("");
    } catch {
      setError("No fue posible conectar con el servicio. Intenta nuevamente.");
      setBusyId("");
    }
  }

  if (requests.length === 0) return <div className="empty-state">Todavía no hay solicitudes para revisar.</div>;

  return (
    <div className="request-list">
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="admin-controls">
        <select aria-label="Filtrar por estado" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="TODAS">Todos los estados</option>
          {Object.entries(requestStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select aria-label="Filtrar por categoría" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="TODAS">Todas las categorías</option>
          {Object.entries(requestCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input aria-label="Buscar solicitudes" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar ID, estudiante o asunto" />
      </div>
      {filteredRequests.length === 0 && <div className="empty-state">No hay solicitudes que coincidan con los filtros.</div>}
      {filteredRequests.map((request) => (
        <article className="request-item" key={request.id}>
          <div className="request-item-head">
            <div>
              <h3>{request.subject}</h3>
              <div className="request-meta">{request.code} · {requestCategoryLabels[request.category]} · {request.student.name} ({request.student.email})</div>
            </div>
            <span className={`status-pill status-${request.status}`}>{requestStatusLabels[request.status]}</span>
          </div>
          <p className="request-description">{request.description}</p>
          {!!request.comments.length && (
            <div className="request-events">
              {request.comments.map((comment) => (
                <p key={comment.id}><strong>{comment.author.name}:</strong> {comment.body}</p>
              ))}
            </div>
          )}
          <div className="admin-controls">
            <select
              aria-label={`Estado de ${request.code}`}
              value={request.status}
              onChange={(event) =>
                setRequests((current) =>
                  current.map((item) =>
                    item.id === request.id ? { ...item, status: event.target.value as ManagedRequest["status"] } : item,
                  ),
                )
              }
            >
              {Object.entries(requestStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <input
              aria-label={`Comentario para ${request.code}`}
              maxLength={2000}
              value={comments[request.id] ?? ""}
              onChange={(event) => setComments((current) => ({ ...current, [request.id]: event.target.value }))}
              placeholder="Respuesta opcional al estudiante"
            />
            <button className="button button-small" type="button" onClick={() => updateRequest(request)} disabled={busyId === request.id}>
              {busyId === request.id ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

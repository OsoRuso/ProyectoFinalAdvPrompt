import { redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { AssistantChat } from "@/components/assistant-chat";
import { getCurrentUser } from "@/lib/auth";

export default async function AssistantPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/admin");

  return (
    <AppFrame user={user}>
      <span className="eyebrow" style={{ color: "var(--blue)" }}>ORIENTACIÓN CON IA</span>
      <h1 className="page-title" style={{ marginTop: 7 }}>¿En qué podemos orientarte?</h1>
      <p className="page-description">Respuestas basadas en artículos de demostración. Si falta información, te lo diremos.</p>
      <div className="two-column">
        <AssistantChat />
        <aside className="card">
          <div className="panel-heading"><h2>Una respuesta con respaldo</h2></div>
          <p className="muted">El asistente revisa el contenido institucional disponible antes de responder. Los nombres de las fuentes aparecen junto a cada respuesta.</p>
          <hr className="divider" />
          <p className="muted">No tenemos documentos reales ni integración con sistemas académicos. Si tu caso requiere una revisión personal, crea una solicitud para el equipo administrativo.</p>
          <a className="button button-secondary" href="/requests">Crear una solicitud</a>
        </aside>
      </div>
    </AppFrame>
  );
}

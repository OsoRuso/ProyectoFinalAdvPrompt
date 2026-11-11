import Link from "next/link";
import { ArrowRight, BookOpenCheck, ClipboardList, MessageCircleMore } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Atención estudiantil, más simple</span>
          <h1>Tu instituto,<br />más cerca.</h1>
          <p>
            Orientación clara, solicitudes con seguimiento y un asistente que responde
            con información institucional, no con suposiciones.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/register">Comenzar como estudiante <ArrowRight size={17} style={{ marginLeft: 8 }} /></Link>
            <Link className="button button-secondary" href="/login">Ya tengo una cuenta</Link>
          </div>
        </div>
      </section>

      <div className="demo-note">
        <strong>Entorno de demostración:</strong> contenido y usuarios son ficticios. IP Conecta no está conectado a una institución ni a sistemas académicos reales.
      </div>

      <section>
        <div className="section-heading">
          <div><h2>La atención que conecta</h2><p>Un mismo espacio para encontrar orientación y saber qué pasa con tu solicitud.</p></div>
        </div>
        <div className="grid grid-three">
          <article className="card feature-card">
            <div className="feature-icon"><MessageCircleMore size={20} /></div>
            <h3>Respuestas con respaldo</h3>
            <p>El asistente utiliza artículos institucionales disponibles y muestra sus fuentes.</p>
          </article>
          <article className="card feature-card">
            <div className="feature-icon"><ClipboardList size={20} /></div>
            <h3>Solicitudes trazables</h3>
            <p>Registra una consulta y revisa su estado desde tu propio panel.</p>
          </article>
          <article className="card feature-card">
            <div className="feature-icon"><BookOpenCheck size={20} /></div>
            <h3>Conocimiento centralizado</h3>
            <p>El equipo administrador mantiene la información de orientación de la institución.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

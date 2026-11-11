"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Article = {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string;
  published: boolean;
};

export function KnowledgeManager({ initialArticles }: { initialArticles: Article[] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({ title: "", category: "", content: "", keywords: "" });
  const router = useRouter();

  async function createArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formElement = event.currentTarget;
    const existing = editingId ? articles.find((article) => article.id === editingId) : undefined;
    const body = { ...formValues, published: existing?.published ?? true };
    try {
      const response = await fetch(editingId ? `/api/knowledge/${editingId}` : "/api/knowledge", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as { article?: Article; error?: string };
      const savedArticle = result.article;

      if (!response.ok || (!editingId && !savedArticle)) {
        setError(result.error ?? "No fue posible guardar el artículo.");
        setBusy(false);
        return;
      }

      if (editingId) {
        setArticles((current) =>
          current.map((article) => article.id === editingId ? { ...article, ...body } : article),
        );
      } else if (savedArticle) {
        setArticles((current) => [...current, savedArticle]);
      }
      setEditingId(null);
      setFormValues({ title: "", category: "", content: "", keywords: "" });
      formElement.reset();
      setBusy(false);
      router.refresh();
    } catch {
      setError("No fue posible conectar con el servicio. Intenta nuevamente.");
      setBusy(false);
    }
  }

  async function togglePublished(article: Article) {
    setError("");
    try {
      const response = await fetch(`/api/knowledge/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...article, published: !article.published }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "No fue posible cambiar la publicación.");
        return;
      }
      setArticles((current) => current.map((item) => item.id === article.id ? { ...item, published: !item.published } : item));
    } catch {
      setError("No fue posible conectar con el servicio. Intenta nuevamente.");
    }
  }

  async function deleteArticle(article: Article) {
    setError("");
    try {
      const response = await fetch(`/api/knowledge/${article.id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "No fue posible eliminar el artículo.");
        return;
      }
      setArticles((current) => current.filter((item) => item.id !== article.id));
    } catch {
      setError("No fue posible conectar con el servicio. Intenta nuevamente.");
    }
  }

  return (
    <div className="two-column">
      <section className="card">
        <div className="panel-heading"><h2>{editingId ? "Editar contenido" : "Agregar contenido"}</h2></div>
        <p className="muted">Usa solo información autorizada. En esta demo, el contenido es ficticio.</p>
        <form className="knowledge-form" onSubmit={createArticle}>
          <div className="field"><label htmlFor="title">Título</label><input id="title" name="title" minLength={3} maxLength={120} value={formValues.title} onChange={(event) => setFormValues((current) => ({ ...current, title: event.target.value }))} required /></div>
          <div className="field"><label htmlFor="category">Categoría</label><input id="category" name="category" minLength={2} maxLength={60} value={formValues.category} onChange={(event) => setFormValues((current) => ({ ...current, category: event.target.value }))} required /></div>
          <div className="field"><label htmlFor="content">Contenido</label><textarea id="content" name="content" minLength={20} maxLength={5000} value={formValues.content} onChange={(event) => setFormValues((current) => ({ ...current, content: event.target.value }))} required /></div>
          <div className="field"><label htmlFor="keywords">Palabras clave</label><input id="keywords" name="keywords" minLength={2} maxLength={300} value={formValues.keywords} onChange={(event) => setFormValues((current) => ({ ...current, keywords: event.target.value }))} required /></div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="inline-actions">
            <button className="button" disabled={busy}>{busy ? "Guardando…" : editingId ? "Actualizar artículo" : "Guardar artículo"}</button>
            {editingId && (
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormValues({ title: "", category: "", content: "", keywords: "" });
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>
      <section className="card">
        <div className="panel-heading"><h2>Artículos ({articles.length})</h2></div>
        <div className="article-list">
          {articles.length === 0 && <div className="empty-state">No hay artículos. Crea el primero.</div>}
          {articles.map((article) => (
            <article className="article-item" key={article.id}>
              <div className="request-item-head">
                <div><h3>{article.title}</h3><p>{article.category} · {article.published ? "Publicado" : "Oculto"}</p></div>
                <div className="inline-actions">
                  <button
                    className="button button-secondary button-small"
                    type="button"
                    onClick={() => {
                      setEditingId(article.id);
                      setFormValues({ title: article.title, category: article.category, content: article.content, keywords: article.keywords });
                    }}
                  >
                    Editar
                  </button>
                  <button className="button button-secondary button-small" type="button" onClick={() => togglePublished(article)}>
                    {article.published ? "Ocultar" : "Publicar"}
                  </button>
                  <button className="button button-danger button-small" type="button" onClick={() => deleteArticle(article)}>Eliminar</button>
                </div>
              </div>
              <p style={{ marginTop: 10 }}>{article.content}</p>
              <p style={{ marginTop: 7 }}>Palabras clave: {article.keywords}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { requestCategoryLabels } from "@/lib/labels";

export function RequestForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.get("category"),
          subject: form.get("subject"),
          description: form.get("description"),
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "No fue posible registrar la solicitud.");
        setBusy(false);
        return;
      }

      formElement.reset();
      router.refresh();
    } catch {
      setError("No fue posible conectar con el servicio. Intenta nuevamente.");
      setBusy(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <div className="field">
        <label htmlFor="category">Categoría</label>
        <select id="category" name="category" defaultValue="CERTIFICADOS">
          {Object.entries(requestCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="subject">Asunto</label>
        <input id="subject" name="subject" minLength={5} maxLength={120} required placeholder="Resume tu consulta" />
      </div>
      <div className="field">
        <label htmlFor="description">Cuéntanos qué necesitas</label>
        <textarea id="description" name="description" minLength={10} maxLength={2000} required placeholder="Incluye los detalles necesarios para orientarte." />
        <span className="help-text">No incluyas contraseñas ni información sensible.</span>
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <button className="button" type="submit" disabled={busy}>{busy ? "Enviando…" : "Enviar solicitud"}</button>
    </form>
  );
}

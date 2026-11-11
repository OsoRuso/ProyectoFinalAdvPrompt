"use client";

import { useState, type FormEvent } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Puedo orientarte usando la información de demostración del instituto. ¿Qué necesitas saber?",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const currentQuestion = question.trim();
    if (!currentQuestion || busy) return;

    setMessages((current) => [...current, { role: "user", content: currentQuestion }]);
    setQuestion("");
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion }),
      });
      const result = (await response.json()) as {
        answer?: string;
        sources?: Array<{ title: string }>;
        error?: string;
      };

      if (!response.ok || !result.answer) {
        setError(result.error ?? "No se pudo completar la consulta. Intenta nuevamente o crea una solicitud.");
      } else {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: result.answer!,
            sources: result.sources?.map((source) => source.title) ?? [],
          },
        ]);
      }
    } catch {
      setError("No fue posible conectar con el asistente. Intenta nuevamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-messages" aria-live="polite">
        {messages.map((message, index) => (
          <div className={`chat-bubble ${message.role === "user" ? "chat-user" : "chat-assistant"}`} key={`${message.role}-${index}`}>
            {message.content}
            {!!message.sources?.length && (
              <span className="chat-sources">Fuentes: {message.sources.join(", ")}</span>
            )}
          </div>
        ))}
        {busy && <div className="chat-bubble chat-assistant">Revisando la información disponible…</div>}
        {error && <div className="form-error" role="alert">{error}</div>}
      </div>
      <form className="chat-form" onSubmit={submit}>
        <input
          aria-label="Escribe tu pregunta"
          maxLength={800}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Escribe tu pregunta…"
          required
        />
        <button className="button" type="submit" disabled={busy || question.trim().length < 3}>Enviar</button>
      </form>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const register = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "No fue posible completar la operación.");
        setBusy(false);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("No fue posible conectar con el servicio. Intenta nuevamente.");
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <section className="auth-card">
        <span className="eyebrow" style={{ color: "var(--blue)" }}>IP CONECTA · DEMOSTRACIÓN</span>
        <h1>{register ? "Crea tu cuenta" : "Qué bueno verte"}</h1>
        <p>
          {register
            ? "Regístrate como estudiante para consultar información y seguir tus solicitudes."
            : "Ingresa para acceder a tu atención estudiantil."}
        </p>
        <form className="form-stack" onSubmit={submit}>
          {register && (
            <div className="field">
              <label htmlFor="name">Nombre</label>
              <input id="name" name="name" autoComplete="name" minLength={2} maxLength={80} required />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              minLength={register ? 12 : 1}
              maxLength={128}
              required
            />
            {register && <span className="help-text">Usa al menos 12 caracteres.</span>}
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="button" type="submit" disabled={busy}>
            {busy ? "Un momento…" : register ? "Crear cuenta de estudiante" : "Iniciar sesión"}
          </button>
        </form>
        <div className="auth-switch">
          {register ? (
            <>¿Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link></>
          ) : (
            <>¿Primera vez aquí? <Link href="/register">Crea tu cuenta</Link></>
          )}
        </div>
      </section>
    </div>
  );
}

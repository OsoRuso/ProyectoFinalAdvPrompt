"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setError("No fue posible cerrar sesión. Intenta nuevamente.");
        setBusy(false);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("No fue posible conectar con el servicio.");
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={signOut} disabled={busy}>
        {busy ? "Cerrando…" : "Cerrar sesión"}
      </button>
      {error && <span className="form-error" role="alert">{error}</span>}
    </>
  );
}

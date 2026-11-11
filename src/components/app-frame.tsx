import Link from "next/link";
import type { ReactNode } from "react";
import type { AuthenticatedUser } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export function AppFrame({
  user,
  children,
}: {
  user: AuthenticatedUser;
  children: ReactNode;
}) {
  return (
    <div className="app-container">
      <div className="app-topline">
        <div className="app-identity">
          <strong>Hola, {user.name}</strong>
          <span>{user.role === "ADMIN" ? "Administración" : "Portal estudiantil"} · Demo ficticia</span>
        </div>
        <nav className="app-nav" aria-label="Navegación del portal">
          {user.role === "ADMIN" ? (
            <>
              <Link href="/admin">Solicitudes</Link>
              <Link href="/knowledge">Base de conocimiento</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">Resumen</Link>
              <Link href="/assistant">Asistente IA</Link>
              <Link href="/requests">Mis solicitudes</Link>
            </>
          )}
          <SignOutButton />
        </nav>
      </div>
      {children}
    </div>
  );
}

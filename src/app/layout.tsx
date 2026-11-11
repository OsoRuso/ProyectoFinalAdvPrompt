import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "IP Conecta — Tu instituto, más cerca",
  description: "Atención y autoservicio estudiantil para Institutos Profesionales y CFT.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            <span className="brand-mark">ip</span>
            <span>IP Conecta</span>
          </Link>
          <nav className="header-links" aria-label="Navegación principal">
            <Link href="/login">Iniciar sesión</Link>
            <Link className="button button-small" href="/register">Crear cuenta</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <span>IP Conecta · Tu instituto, más cerca</span>
          <span>Demostración académica con información ficticia</span>
        </footer>
      </body>
    </html>
  );
}

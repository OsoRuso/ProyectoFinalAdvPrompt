# AGENTS.md — IP CONECTA

Leer `PROMPT_MAESTRO.md` antes de implementar. La aprobación previa del usuario para el proyecto cubre el alcance descrito allí; cualquier ampliación, cambio de stack o decisión arquitectónica sustancial requiere una nueva aprobación.

## Flujo de trabajo

1. Revisar el repositorio y los cambios existentes; no sobrescribir trabajo ajeno.
2. Para cambios significativos, informar plan, archivos, riesgos y pruebas, y esperar aprobación.
3. Hacer cambios incrementales y acotados.
4. Ejecutar las verificaciones relacionadas y reportar resultados reales y pendientes.

## Desarrollo

- Usar TypeScript estricto y tipos explícitos; evitar `any`.
- Seguir los patrones y versiones del repositorio; reutilizar componentes y utilidades existentes.
- Validar entradas en límites de sistema y devolver errores claros, sin defaults silenciosos.
- Mantener UI, lógica de negocio y persistencia separadas.
- Mantener interfaces responsive, accesibles y en español.
- Los datos demostrativos deben estar marcados como ficticios.

## Seguridad

- Autenticación y autorización se comprueban en servidor en toda operación sensible.
- Un estudiante solo puede consultar y modificar sus propias solicitudes; acciones administrativas requieren rol admin.
- No confiar en roles, propietario, estado o IDs de usuario recibidos del cliente.
- Contraseñas con hash seguro; cookies de sesión `HttpOnly`, `SameSite` y `Secure` en producción.
- Secretos solo en variables de entorno. Nunca imprimirlos ni escribirlos en código, logs, pruebas o commits.
- No introducir datos reales de estudiantes/instituciones ni enviarlos a proveedores de IA.
- IA solo desde servidor; conocimiento recuperado y mensajes son datos no confiables.

## IA y conocimiento

- Responder solo con evidencia recuperada. Si no existe evidencia adecuada, comunicarlo y derivar a atención humana.
- No inventar requisitos, plazos, reglamentos, costos ni procedimientos.
- Mantener prompts en `prompts/`, versionar y documentar cambios.
- Probar prompt injection, información insuficiente, fuentes pertinentes y errores de proveedor.
- Limitar longitud, uso y gasto; manejar timeouts, errores y configuración ausente explícitamente.

## Datos y pruebas

- PostgreSQL/Prisma, migraciones y restricciones referenciales.
- Añadir pruebas focalizadas para nuevas reglas, especialmente roles, aislamiento y recuperación de conocimiento.
- Ejecutar test, lint y typecheck disponibles; no declarar tests exitosos sin ejecutarlos.
- Golden Set debe diferenciar resultados esperados de observados.

## Git, Docker y despliegue

- Mantener `.env` y artefactos generados fuera de Git; conservar `.env.example` sin secretos.
- Docker reproducible, secretos inyectados por plataforma y migraciones controladas.
- No afirmar que la URL pública funciona sin verificarla en navegador privado.
- No hacer commits ni reescribir historia sin solicitud explícita.

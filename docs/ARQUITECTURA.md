# Arquitectura — IP Conecta

## Alcance

MVP web monolítico para una institución ficticia. No es multitenant de producción ni se integra con sistemas académicos reales.

## Componentes

- **Next.js App Router:** páginas y Route Handlers de autenticación, solicitudes, conocimiento y asistente.
- **React + TypeScript + Tailwind CSS:** interfaz responsive en español.
- **PostgreSQL + Prisma:** usuarios, sesiones, artículos, solicitudes, comentarios e historial de estados.
- **Protección del login:** registra fallos por correo mediante HMAC con una clave de entorno y limita a diez intentos por hora; conserva hashes, no el correo introducido.
- **OpenAI API:** generación en servidor a partir de artículos recuperados; la API key no se entrega al navegador.
- **Docker:** imagen reproducible para plataforma cloud compatible.

## Flujo del asistente

1. Verificar sesión y rol estudiante.
2. Validar longitud de la pregunta.
3. Recuperar artículos publicados y rankearlos por coincidencias con palabras clave.
4. Si no hay evidencia pertinente, devolver una respuesta de insuficiencia sin invocar el modelo.
5. Enviar al modelo la pregunta y los fragmentos relevantes como datos no confiables, con el prompt del sistema desde `prompts/`.
6. Devolver respuesta y títulos de fuentes utilizadas; manejar configuración ausente, timeout y errores del proveedor explícitamente.

La búsqueda usa coincidencias de palabras completas y variantes simples de singular/plural, prioriza título y palabras clave, descarta coincidencias débiles respecto del resultado principal y elimina copias idénticas del contexto. Mantiene el MVP sin infraestructura vectorial; no entiende sinónimos ni garantiza pertinencia semántica. Su cobertura debe evaluarse con el Golden Set.

## Modelo de datos

- `User`: nombre, email único, hash de contraseña, rol.
- `Session`: hash del token aleatorio, usuario y expiración.
- `LoginAttempt`: hash HMAC del correo y fecha del intento fallido.
- `KnowledgeArticle`: título, categoría, contenido, palabras clave, publicación.
- `Request`: estudiante, categoría, asunto, descripción, estado y fechas.
- `RequestComment`: autor, respuesta/comentario y fecha.
- `RequestStatusEvent`: estado anterior/nuevo, actor y fecha.

Las operaciones de estudiantes filtran por usuario autenticado en servidor. Las operaciones administrativas comprueban el rol antes de consultar o mutar.

## Límites y riesgos

- El ranking por palabras clave puede no recuperar sinónimos; se medirá con casos del Golden Set.
- El modelo puede fallar o estar sin configurar; la aplicación debe presentar un error claro y conservar la vía de solicitud humana.
- El seed es contenido ficticio. No utilizar documentos reales sin autorización.
- El seed omite artículos cuyos títulos ya existen para que una ejecución posterior no sobrescriba ediciones. No elimina duplicados ya existentes; la protección no garantiza idempotencia ante ejecuciones concurrentes.
- El despliegue necesita PostgreSQL, secretos, cuenta cloud y límite de gasto de IA configurados fuera del repositorio.
- La disponibilidad, costo y escalabilidad no se consideran validados hasta probar el proveedor elegido.

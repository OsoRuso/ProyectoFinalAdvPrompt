# IP Conecta

**Tu instituto, más cerca.** Plataforma de atención y autoservicio para estudiantes de Institutos Profesionales y Centros de Formación Técnica.

> Demostración académica con datos ficticios. No representa ni se conecta con una institución real.

IP Conecta centraliza preguntas frecuentes y solicitudes estudiantiles. Su asistente generativo responde usando únicamente artículos institucionales disponibles; cuando no encuentra respaldo suficiente, lo indica y deriva al estudiante a una solicitud con seguimiento.

## Idea de negocio

- **Cliente comprador:** IP y CFT chilenos, inicialmente aquellos cuyos equipos de atención reciben consultas repetitivas por canales dispersos.
- **Usuarios:** estudiantes y personal administrativo.
- **Propuesta de valor:** autoservicio con respuestas fundamentadas, trazabilidad de solicitudes y una bandeja administrativa centralizada.
- **Modelo de ingresos propuesto:** suscripción B2B mensual o anual por tramo de matrícula/volumen, más configuración inicial opcional. Es una hipótesis comercial por validar, no una tarifa de mercado comprobada.
- **IA generativa:** consulta el conocimiento institucional recuperado, redacta una respuesta en español y devuelve las fuentes utilizadas. No inventa requisitos, fechas ni procedimientos.

La descripción completa está en [docs/IDEA_NEGOCIO.md](./docs/IDEA_NEGOCIO.md).

## Funcionalidades del MVP

- Registro e inicio de sesión para estudiantes; el administrador se habilita mediante variables de entorno.
- Asistente con recuperación por palabras clave sobre artículos ficticios.
- Creación y seguimiento de solicitudes por el estudiante.
- Revisión, comentarios y actualización de estados por el administrador.
- Administración de artículos de conocimiento.
- Persistencia en PostgreSQL.

## Stack y arquitectura

Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM y OpenAI API (modelo configurable; valor inicial `gpt-6-luna`). Las operaciones sensibles y las llamadas a OpenAI ocurren en el servidor. La arquitectura y sus límites se documentan en [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md).

## Requisitos

- Node.js 20.9 o posterior.
- PostgreSQL.
- Una clave de OpenAI para habilitar respuestas generativas.

## Configuración local

1. Copiar `.env.example` a `.env` y completar `DATABASE_URL`, `OPENAI_API_KEY`, un `AUTH_RATE_LIMIT_SECRET` aleatorio de al menos 32 caracteres y credenciales admin únicas de al menos 12 caracteres. `AI_REQUESTS_PER_HOUR` limita consultas por cuenta.
2. Instalar dependencias: `npm ci`.
3. Generar Prisma y aplicar migraciones: `npm run db:generate` y `npm run db:migrate`.
4. Cargar el contenido de demostración: `npm run db:seed`.
5. Iniciar: `npm run dev`.

El registro público crea solo cuentas de estudiante. Para habilitar la cuenta administradora se requieren `ADMIN_EMAIL` y `ADMIN_PASSWORD` en el entorno y ejecutar el seed. No hay credenciales de acceso incrustadas en el repositorio.

## Pruebas y prompt engineering

- `npm test`: pruebas unitarias del ranking de conocimiento y utilidades.
- `npm run lint` y `npm run typecheck`: calidad estática.
- `npm run eval:prompts`: ejecuta v1 y v2 sobre el Golden Set con contenido ficticio; requiere una clave de OpenAI y genera consumo API.
- El Golden Set y el procedimiento para comparar versiones del prompt están en [docs/GOLDEN_SET.md](./docs/GOLDEN_SET.md); los resultados observados deben completarse únicamente después de ejecutar las pruebas con una clave válida.
- Prompts versionados: `prompts/system_assistant_v1.md` (línea base) y `prompts/system_assistant_v2.md` (versión refinada); producción utiliza `prompts/system_assistant.md`.

## Despliegue

El proyecto incluye un `Dockerfile` y requiere una base PostgreSQL accesible desde el contenedor. Configurar secretos en la plataforma, ejecutar `npm run db:migrate` y `npm run db:seed`, y comprobar el flujo en una ventana privada. No se debe publicar hasta configurar credenciales, límite de gasto de IA y una URL real.

## Entregables del curso

- Aplicación desplegada en una URL pública.
- Repositorio GitHub con instrucciones, arquitectura y prompts.
- [Video demo de hasta tres minutos](./docs/VIDEO_DEMO.md) (guion; grabación pendiente).
- [Ficha de negocio de una página](./docs/FICHA_NEGOCIO.pdf) con costos y supuestos; fuente editable en [docs/FICHA_NEGOCIO.md](./docs/FICHA_NEGOCIO.md).

La ficha es una estimación de demostración basada en precios públicos y escenarios explícitos, no una cotización. Recalcular cuando se seleccione región y se mida el consumo real.
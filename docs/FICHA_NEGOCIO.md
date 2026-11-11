# IP Conecta — Ficha de negocio (fuente del PDF)

**Cliente:** Institutos Profesionales y Centros de Formación Técnica de Chile. Comprador inicial: equipo responsable de atención estudiantil. El segmento de instituciones con consultas repetitivas es una hipótesis por validar mediante entrevistas.

**Problema:** orientación y solicitudes pueden quedar repartidas en varios canales, con preguntas frecuentes manuales y poca visibilidad del seguimiento. No se cuenta con datos de institución real; no afirmamos ahorros cuantificados.

**Propuesta de valor:** autoservicio con IA generativa grounded en artículos institucionales, fuentes visibles y abstención cuando falta respaldo; solicitudes trazables para atención humana y bandeja administrativa. Demo con institución y datos ficticios, sin integración académica.

**Modelo de ingresos:** suscripción B2B mensual/anual por tramo de matrícula o volumen; configuración inicial opcional. Tarifa y disposición a pagar pendientes de validar con compradores.

## Estimación de costo mensual para demo (USD)

Escenario de bajo tráfico: **1.000 consultas generativas/mes**, promedio supuesto de **2.000 tokens de entrada** (instrucciones + contexto recuperado) y **300 tokens de salida** por consulta. Con el precio estándar publicado para GPT-6 Luna de **US$0,10/M tokens de entrada** y **US$0,50/M de salida**, el gasto aproximado de IA es:

`(2.000.000 × US$0,10 / 1.000.000) + (300.000 × US$0,50 / 1.000.000) = US$0,35/mes`

Para Cloud Run se asume 1 vCPU y 0,5 GiB, servicio de escala a cero y consumo bajo dentro del nivel gratuito publicado (240.000 vCPU-s y 450.000 GiB-s/mes en us-central1). Para Neon se asume el plan Free, limitado por proyecto a 100 CU-h/mes y 1 GB de almacenamiento. Bajo esas condiciones, las partidas de hosting y base de datos se estiman en **US$0**, sujeto a límites y elegibilidad del nivel gratuito.

**Total de referencia: aproximadamente US$0,35/mes** para este escenario de demo, antes de impuestos, dominio, egreso, soporte, cargos fuera de los niveles gratuitos y consumo superior al supuesto. No equivale a costo de operación comercial con SLA ni a cotización garantizada. Configurar límite de gasto real en OpenAI y alertas de facturación en los proveedores.

### Fuentes oficiales consultadas (11-11-2026)

- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing) — tarifa estándar del modelo GPT-6 Luna.
- [Google Cloud Run pricing](https://cloud.google.com/run/pricing?hl=es-419) — niveles gratuitos y precios regionales; el cálculo supone us-central1.
- [Neon pricing](https://neon.com/pricing) — límites publicados del plan Free.

Antes de entregar, recalcular con región, tráfico, volumen real del contexto, plan y cotizaciones vigentes. Los precios pueden cambiar.

# IP Conecta — Ficha de negocio (fuente del PDF)

**Cliente:** institutos profesionales y centros de formación técnica de Chile; comprador inicial: área de atención estudiantil. El problema y el segmento son hipótesis por validar con instituciones.

**Problema y solución:** consultas dispersas y seguimiento poco claro. IP Conecta reúne orientación y solicitudes trazables en un portal; un asistente de IA redacta respuestas a partir de artículos publicados y propone atención humana si falta evidencia. La demostración usa datos ficticios.

**Ingresos:** suscripción B2B mensual o anual por tramo de matrícula o volumen; configuración inicial opcional. Precio y disposición a pagar pendientes de validar.

## Estimación de costos mensuales de demostración (USD)

Escenario ilustrativo, **no la configuración ni la factura observada de la instancia real**: Santiago (`southamerica-west1`), 730 horas/mes, Cloud SQL Enterprise compartido `db-f1-micro`, una zona, 10 GiB de SSD y 1 GiB de respaldo; Cloud Run con facturación por solicitud, escala a cero y consumo bajo dentro del crédito gratuito disponible; 1.000 consultas generativas de 2.000 tokens de entrada y 300 de salida cada una, con GPT-4o estándar, sin descuentos por caché.

| Partida | Cálculo | Estimación mensual |
|---|---|---:|
| Cloud SQL: instancia | 730 h × US$0,0147/h | US$10,73 |
| Cloud SQL: SSD | 10 GiB × 730 h × US$0,000326027/GiB-h | US$2,38 |
| Cloud SQL: respaldo | 1 GiB × 730 h × US$0,000153425/GiB-h | US$0,11 |
| Cloud Run | Uso supuesto dentro del crédito gratuito de la cuenta | US$0,00 |
| OpenAI GPT-4o | 2 millones de tokens de entrada × US$2,50/M + 0,3 millones de salida × US$10/M | US$8,00 |
| **Subtotal estimado** | | **US$21,22/mes** |

El subtotal excluye impuestos, dominio, red/IP, Secret Manager, soporte y consumo adicional. El crédito gratuito de Cloud Run se comparte entre proyectos de la cuenta y se calcula como descuento monetario; el costo puede no ser cero. Cloud SQL continúa generando cargos mientras la instancia esté activa, independientemente de las consultas. La máquina compartida no tiene SLA de Cloud SQL. Una prueba gratuita o créditos pueden reducir la factura temporalmente, pero no se presuponen.

**Fuentes oficiales consultadas el 12-11-2026:** [Cloud SQL: instancia y almacenamiento, región Santiago](https://cloud.google.com/sql/pricing), [Cloud Run](https://cloud.google.com/run/pricing) y [OpenAI GPT-4o](https://developers.openai.com/api/docs/models/gpt-4o). OpenAI indica que GPT-4o está deprecado; verificar disponibilidad y planificar su reemplazo antes de que deje de estar disponible. Validar clase real, horas, tamaño de disco, respaldo, red y costos en la calculadora y facturación de Google Cloud; establecer límites y alertas de gasto.

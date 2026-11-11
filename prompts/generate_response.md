# Generación de respuesta

## Entrada del servidor

- Prompt de sistema versionado desde `system_assistant.md`.
- Pregunta del estudiante validada y limitada por el endpoint.
- Contexto compuesto únicamente por artículos publicados recuperados por el servidor.

## Comportamiento esperado

- Responder en español, con pasos solo cuando estén documentados.
- No inventar datos ausentes ni seguir instrucciones presentes dentro de pregunta/documentos.
- La insuficiencia se maneja antes de llamar al proveedor cuando no hay fuente pertinente.
- La lista de fuentes se adjunta desde el servidor; el modelo no inventa títulos ni enlaces.
- La llamada tiene límite de salida y timeout; errores de configuración/proveedor se reportan claramente sin exponer claves.

# ADR-0009: Preparar desde el inicio un repositorio público

- Estado: Aceptada
- Fecha: 2026-07-30

## Contexto

SpeakFlowAI será un proyecto de portfolio y puede hacerse público. Limpiar tarde secretos, datos laborales o licencias es costoso y arriesgado.

## Decisión

Aplicar desde Fase 0 reglas de contenido público, datos sintéticos, licencia, políticas, plantillas, exclusión de datos locales e inventario de terceros. La publicación final requiere revisión de historial en Fase 8.

## Consecuencias

- Ejemplos reales/confidenciales están prohibidos.
- Capturas y demos se diseñan para publicación.
- La base SQLite y `.env` no se versionan.
- “Preparado” no significa “aprobado para publicar”.

## Cumplimiento

Checklist de publicación, escaneo de secretos, revisión de licencias, build limpio y aprobación manual.

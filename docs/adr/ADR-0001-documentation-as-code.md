# ADR-0001: Documentación como código

- Estado: Aceptada
- Fecha: 2026-07-30

## Contexto

Usuarios y contribuidores necesitan documentación navegable, pero las fuentes deben evolucionar junto al software y revisarse en pull requests.

## Decisión

Mantener Markdown/MDX canónico en `docs/`, enlaces relativos y diagramas Mermaid. El sitio genera HTML; no se duplican manualmente los documentos en componentes React.

## Consecuencias

- Los cambios de comportamiento incluyen actualización documental.
- CI validará enlaces, Mermaid y build en los cierres apropiados.
- Contenido dinámico dependiente de backend no forma parte del sitio estático.
- Los documentos deben ser útiles también en lectura directa del repositorio.

## Cumplimiento

Revisión de PR, build documental y matriz de trazabilidad.

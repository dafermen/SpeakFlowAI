# ADR-0002: Usar VitePress para el sitio documental

- Estado: Aceptada
- Fecha: 2026-07-30

## Contexto

Se requiere búsqueda, navegación responsive, Mermaid, modo oscuro, salida estática y compatibilidad con GitHub Pages, sin añadir infraestructura innecesaria.

## Decisión

Usar VitePress en un paquete `docs-site/` separado que consume `docs/`. Configurar búsqueda local, Mermaid y `base` por entorno.

## Alternativas

- Docusaurus: potente y React, pero más pesado para el MVP.
- Astro Starlight: buena alternativa, con una integración adicional para parte de los requisitos.
- MkDocs Material: maduro, pero agrega una cadena Python a un monorepo ya JavaScript/Python.

## Consecuencias

- El runtime Vue de VitePress queda aislado del frontend React.
- El build no necesita backend ni secretos.
- Los plugins se mantienen mínimos y con licencia registrada.

## Cumplimiento

La Fase 1 crea el paquete; cada cierre de fase valida build, enlaces, Mermaid y base path.

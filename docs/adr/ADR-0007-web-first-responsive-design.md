# ADR-0007: Diseño web-first responsive

- Estado: Aceptada
- Fecha: 2026-07-30

## Contexto

La sesión debe funcionar en móvil, tableta, escritorio y futuras WebViews de Capacitor sin mantener aplicaciones visualmente desconectadas.

## Decisión

Diseñar mobile-first una sola arquitectura de información, adaptar navegación y paneles por espacio/capacidad, y encapsular APIs de dispositivo. Priorizar teléfono vertical y safe areas.

## Consecuencias

- La web se estabiliza antes de proyectos iOS/Android.
- Breakpoints son tokens y no detección de dispositivo.
- Permisos, audio y ciclo de vida usan adaptadores preparados para Capacitor.
- Escritorio añade contexto sin cambiar tareas.

## Cumplimiento

Matriz de viewports, teclado, zoom, orientación, reduced motion y safe areas en criterios de fase.

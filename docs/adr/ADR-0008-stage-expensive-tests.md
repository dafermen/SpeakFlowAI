# ADR-0008: Ejecutar pruebas costosas por etapa

- Estado: Aceptada
- Fecha: 2026-07-30

## Contexto

Ejecutar toda la estrategia de pruebas tras cada cambio pequeño ralentiza el aprendizaje del MVP, pero diferir toda validación aumenta riesgo.

## Decisión

Usar tres niveles: pruebas enfocadas por iteración, suites completas relevantes al cierre de fase y puerta exhaustiva en Fase 6 antes de producción.

## Consecuencias

- Feedback rápido durante desarrollo.
- La arquitectura conserva testabilidad completa.
- No se eliminan ni debilitan pruebas.
- Mutación, fuzzing, rendimiento, resiliencia, compatibilidad y seguridad completa se concentran en endurecimiento, salvo necesidad de riesgo inmediato.

## Cumplimiento

Cada PR registra validación enfocada; cada fase archiva informe; producción requiere puerta completa documentada.

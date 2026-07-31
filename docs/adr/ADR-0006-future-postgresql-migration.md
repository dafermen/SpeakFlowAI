# ADR-0006: Ruta futura de migración a PostgreSQL

- Estado: Aceptada
- Fecha: 2026-07-30

## Contexto

SQLite es suficiente ahora, pero el producto puede requerir persistencia compartida y mayor concurrencia.

## Decisión

Tratar PostgreSQL como adaptador futuro. Antes del cambio se ejecutarán las pruebas de repositorio contra ambos motores, un ensayo de transferencia, validaciones de integridad y un plan de rollback.

## Estrategia

1. Aprobar un disparador medible.
2. Añadir PostgreSQL como entorno opcional de integración.
3. Resolver diferencias sin filtrar lógica SQL al dominio.
4. Migrar una copia y comparar recuentos, IDs, relaciones y timestamps.
5. Programar ventana final, backup y rollback.
6. Cambiar solo la configuración tras aceptación.

## Consecuencias

- Se evita abstracción especulativa más allá de límites claros.
- Las funciones exclusivas de un motor requieren ADR.
- La migración de datos es un proyecto explícito, no un simple cambio de URL.

## Cumplimiento

Checklist de disparadores y suite portable de repositorios.

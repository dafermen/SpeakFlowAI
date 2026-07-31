# ADR-0004: JSON para contenido estático de aprendizaje

- Estado: Aceptada
- Fecha: 2026-07-30

## Contexto

Modos, escenarios y definiciones cambian con versiones de producto, no con cada sesión de usuario.

## Decisión

Guardar contenido estático/semiestático en JSON, validado con JSON Schema Draft 2020-12 y Ajv. Separar IDs estables de texto localizable.

## Consecuencias

- El contenido se revisa y publica con el código.
- Referencias, duplicados y esquema se validan en CI.
- Datos modificados frecuentemente por la persona siguen en SQLite.
- Se crean solo archivos requeridos por la fase activa.

## Cumplimiento

Schemas, ejemplos válidos/inválidos, prueba del cargador y verificación de datos sintéticos.

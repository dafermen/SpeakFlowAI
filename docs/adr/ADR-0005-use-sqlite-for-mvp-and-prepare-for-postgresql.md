# ADR-0005: Usar SQLite para el MVP y preparar PostgreSQL

- Estado: Aceptada
- Fecha: 2026-07-30

## Contexto

El MVP sirve a una persona local. Exigir un servidor PostgreSQL aumentaría configuración y tiempo sin aportar valor proporcional.

## Decisión

Usar SQLite con SQLAlchemy 2.x y Alembic. La base vive en `data/` configurable y no se versiona. Se activan foreign keys, constraints y timestamps UTC.

## Limitaciones

- Concurrencia de escritura limitada.
- Sin servicio administrado, replicación ni alta disponibilidad.
- Diferencias de tipos, colación y alteración de esquema.
- Menor adecuación a múltiples instancias y usuarios.

## Compatibilidad obligatoria

- Repositorios separan persistencia del dominio.
- Tipos e IDs son portables.
- SQL específico queda aislado.
- Migraciones crean/cambian tablas.
- Las pruebas de integración podrán apuntar a PostgreSQL.

## Disparadores

Múltiples usuarios, nube compartida, mayor concurrencia/volumen, varias instancias, informes avanzados, cuentas de equipo o requisitos operativos gestionados.

## Consecuencias

Desarrollo local simple ahora y trabajo explícito de migración si aparecen esos disparadores. PostgreSQL no es dependencia obligatoria del MVP.

## Cumplimiento

Revisión de modelos/consultas, migraciones Alembic, pruebas de constraints y `.gitignore`.

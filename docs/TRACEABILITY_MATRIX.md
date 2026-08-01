# Matriz de trazabilidad de Fase 0

| Requisito                                     | Evidencia                                                                                                                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Producto y alcance                            | [PRODUCT](PRODUCT.md), [MVP_SCOPE](MVP_SCOPE.md)                                                                                                                 |
| Recorridos y arquitectura de información      | [USER_JOURNEYS](USER_JOURNEYS.md), [INFORMATION_ARCHITECTURE](INFORMATION_ARCHITECTURE.md)                                                                       |
| Onboarding, Home, setup, sesión y revisión    | [UX_DESIGN](UX_DESIGN.md)                                                                                                                                        |
| Visual y tokens                               | [DESIGN_SYSTEM](DESIGN_SYSTEM.md)                                                                                                                                |
| Mobile-first, safe areas, Capacitor readiness | [RESPONSIVE_DESIGN](RESPONSIVE_DESIGN.md), [ADR-0007](adr/ADR-0007-web-first-responsive-design.md)                                                               |
| SQLite y herramientas                         | [DATABASE_STRATEGY](DATABASE_STRATEGY.md), [ADR-0005](adr/ADR-0005-use-sqlite-for-mvp-and-prepare-for-postgresql.md)                                             |
| Ruta PostgreSQL                               | [DATABASE_STRATEGY](DATABASE_STRATEGY.md), [ADR-0006](adr/ADR-0006-future-postgresql-migration.md)                                                               |
| LocalStorage                                  | [LOCAL_STORAGE](LOCAL_STORAGE.md), [ADR-0003](adr/ADR-0003-localstorage-for-unauthenticated-preferences.md)                                                      |
| JSON                                          | [CONTENT_STRATEGY](CONTENT_STRATEGY.md), [ADR-0004](adr/ADR-0004-json-for-static-learning-content.md)                                                            |
| Arquitectura y secretos                       | [ARCHITECTURE](ARCHITECTURE.md), [SECURITY](/SECURITY)                                                                                                           |
| Documentación HTML                            | [DOCUMENTATION_SITE](DOCUMENTATION_SITE.md), [ADR-0001](adr/ADR-0001-documentation-as-code.md), [ADR-0002](adr/ADR-0002-use-vitepress-for-documentation-site.md) |
| GitHub Pages                                  | [DOCUMENTATION_SITE](DOCUMENTATION_SITE.md), [GITHUB_PUBLICATION](GITHUB_PUBLICATION.md)                                                                         |
| Repositorio público                           | [GITHUB_PUBLICATION](GITHUB_PUBLICATION.md), [ADR-0009](adr/ADR-0009-public-github-readiness.md)                                                                 |
| Pruebas por etapa                             | [TESTING_STRATEGY](TESTING_STRATEGY.md), [ADR-0008](adr/ADR-0008-stage-expensive-tests.md)                                                                       |
| Fases secuenciales                            | [ROADMAP](phases/ROADMAP.md), [TASKS](/TASKS), [AGENTS](/AGENTS)                                                                                                 |
| Estado y siguiente tarea exacta               | [CURRENT_STATUS](/CURRENT_STATUS), [PHASE_0](phases/PHASE_0.md)                                                                                                  |

## Comprobaciones negativas

- Autenticación no forma parte del MVP.
- PostgreSQL no es una dependencia obligatoria del MVP.
- La suite completa no se exige en cada cambio pequeño.
- La Fase 0 no contiene implementación de producción.

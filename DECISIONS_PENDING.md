# Decisiones pendientes

No hay decisiones que bloqueen la revisión de Fase 1.

## Decisiones deliberadamente diferidas

| Momento | Decisión | Razón |
| --- | --- | --- |
| Fase 1, P1-T01 | Gestor/workspace exacto del monorepo | Confirmar versiones vigentes al implementar |
| Fase 1, P1-T06 | Librería concreta de iconos | Revisar licencia, peso y cobertura |
| Fase 2 | Catálogo inicial exacto de escenarios | Validar con flujo local |
| Fase 3 | Modelo/API de voz exactos | Usar documentación y precios vigentes |
| Fase 3 | Política cuantitativa de costes | Depende del proveedor y modelo |
| Fase 7 | Versiones/plataformas mínimas iOS/Android | Depende de Capacitor vigente |
| Cuando ocurra un disparador | Fecha de migración PostgreSQL | No necesaria para el MVP local |

## Avisos técnicos no bloqueantes

| Aviso | Tratamiento |
| --- | --- |
| FastAPI/Starlette avisa que su TestClient migrará de `httpx` a `httpx2` | Mantener prueba actual y revisar al actualizar FastAPI; no agregar una dependencia prematura |
| Mermaid produce un chunk documental mayor de 500 kB | Aceptable para la fundación; medir y dividir solo si afecta la experiencia en Fase 5/6 |

Toda decisión se resuelve en su fase, se registra en ADR si es estructural y no desbloquea trabajo anticipado.

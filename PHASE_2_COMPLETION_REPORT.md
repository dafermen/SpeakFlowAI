# Informe de cierre de Fase 2

Fecha: 2026-07-31

## Resultado

La experiencia local del estudiante está completa. Una persona puede terminar o reanudar el onboarding, guardar sus preferencias y perfil local, elegir uno de cuatro escenarios, preparar una sesión y recorrer una conversación determinista sin proveedor externo.

## Entregables

- Onboarding de seis pasos con borrador versionado en LocalStorage.
- Perfil local ampliado en SQLite mediante repositorio y migración Alembic `0002`.
- Preferencias de nivel, voz, velocidad, ayuda en español, subtítulos y tema.
- Home con llamada principal, práctica recomendada, objetivo y estado vacío.
- Cuatro modos y cuatro escenarios validados con JSON Schema.
- Configuración previa y tutor falso determinista con transcripción y controles.
- Recuperación segura ante datos locales corruptos, almacenamiento no disponible y API inactiva.

## Evidencia

- TypeScript: 15 pruebas aprobadas.
- Python: 4 pruebas aprobadas, incluida actualización idempotente del perfil.
- ESLint, Ruff, TypeScript estricto y mypy estricto: aprobados.
- Builds de React y VitePress: aprobados.
- Revisión visual a 390 × 844 y 1280 × 800: sin desbordamiento horizontal.

## Riesgos no bloqueantes

- FastAPI advierte que `TestClient` migrará de `httpx` a `httpx2`.
- El paquete Mermaid de VitePress genera un chunk superior a 500 kB.

Ambos riesgos quedan registrados para el endurecimiento de Fase 6.

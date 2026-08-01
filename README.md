# SpeakFlowAI

SpeakFlowAI es un compañero de voz con IA para que una persona adulta practique inglés con menos ansiedad, objetivos claros y retroalimentación útil. El MVP es una aplicación personal, local y sin autenticación.

## Estado

Las **Fases 0 a 8** están completas y conforman la versión **1.0.0**. La
experiencia incluye onboarding, escenarios, tutor local, voz Realtime, feedback,
progreso, proyectos móviles y un paquete de publicación.

- Estado detallado: [CURRENT_STATUS.md](CURRENT_STATUS.md)
- Informe de cierre: [PHASE_0_COMPLETION_REPORT.md](PHASE_0_COMPLETION_REPORT.md)
- Cierre de Fase 1: [PHASE_1_COMPLETION_REPORT.md](PHASE_1_COMPLETION_REPORT.md)
- Cierre de Fase 2: [PHASE_2_COMPLETION_REPORT.md](PHASE_2_COMPLETION_REPORT.md)
- Cierre de Fase 8: [PHASE_8_COMPLETION_REPORT.md](PHASE_8_COMPLETION_REPORT.md)
- Caso de estudio: [docs/CASE_STUDY.md](docs/CASE_STUDY.md)
- Notas de versión: [RELEASE_NOTES_1.0.0.md](RELEASE_NOTES_1.0.0.md)
- Trabajo secuencial: [TASKS.md](TASKS.md)
- Índice documental: [docs/README.md](docs/README.md)
- Decisiones arquitectónicas: [docs/adr/README.md](docs/adr/README.md)
- Roadmap: [docs/phases/ROADMAP.md](docs/phases/ROADMAP.md)

## Decisiones principales del MVP

| Tema           | Decisión                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| Base de datos  | SQLite mediante SQLAlchemy 2.x y migraciones Alembic                                                    |
| Evolución      | Repositorios y tipos portables para facilitar la futura migración a PostgreSQL                          |
| Identidad      | Un perfil local; sin login, registro, OAuth ni roles                                                    |
| Preferencias   | Adaptador LocalStorage tipado, versionado y validado                                                    |
| Contenido      | JSON Schema para modos, escenarios y contenido estático                                                 |
| Voz            | Integración en una fase posterior, mediada por FastAPI; nunca se expone la clave de OpenAI al navegador |
| Aplicación web | React, responsive y mobile-first; base preparada para Capacitor                                         |
| Documentación  | Markdown/MDX generado como HTML estático con VitePress                                                  |
| Pruebas        | Pruebas enfocadas en cada iteración; puerta completa en endurecimiento previo a producción              |

## Secuencia obligatoria

Las fases se ejecutaron de forma estrictamente secuencial: cada fase cumplió su
puerta de calidad antes de desbloquear la siguiente. El detalle y las validaciones
externas pendientes se conservan en [TASKS.md](TASKS.md).

## Alcance de este repositorio

El repositorio incluye React/FastAPI, SQLite/Alembic, voz Realtime, preferencias
locales, contenido JSON validado, sistema visual, Capacitor, documentación
VitePress, CI y una experiencia completa con fallback local.

## Inicio local

Requisitos: Node.js 24, pnpm 11.9 y Python 3.12.

```powershell
pnpm install
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".\apps\api[dev]"
```

Aplicación y documentación:

```powershell
pnpm dev
```

API, en otra terminal:

```powershell
.\.venv\Scripts\python.exe -m uvicorn speakflow_api.main:app --app-dir apps/api/src --reload --port 8000
```

Migración local:

```powershell
.\.venv\Scripts\python.exe -m alembic -c apps/api/alembic.ini upgrade head
```

Guía completa: [docs/development/GETTING_STARTED.md](docs/development/GETTING_STARTED.md).

## Aprender con el código

El código de producción incluye docstrings y TSDoc orientados a estudiantes:
propósito, contratos, entradas, salidas, errores y efectos secundarios. Para
estudiar el sistema sin leer los archivos al azar, comienza por el
[recorrido guiado](docs/development/CODE_WALKTHROUGH.md) y consulta el
[estándar de documentación](docs/development/CODE_DOCUMENTATION_STANDARD.md).

## Seguridad

No agregues claves, transcripciones personales, audio, datos empresariales confidenciales ni identificadores reales. Consulta [SECURITY.md](SECURITY.md) y [docs/GITHUB_PUBLICATION.md](docs/GITHUB_PUBLICATION.md).

## Licencia

MIT. Consulta [la licencia](docs/LICENSE.md).

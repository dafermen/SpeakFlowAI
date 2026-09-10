# Preparar el entorno local

## Requisitos

- Node.js 24.
- pnpm 11.9, fijado por `packageManager`.
- Python 3.12.
- Git.

PostgreSQL, cuentas y proyectos nativos no son requisitos del MVP.

## Instalar

### Windows PowerShell

```powershell
pnpm install
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".\apps\api[dev]"
```

### macOS/Linux

```bash
pnpm install
python3.12 -m venv .venv
./.venv/bin/python -m pip install -e "./apps/api[dev]"
```

## Ejecutar toda la aplicación

Desde la raíz del repositorio:

```powershell
pnpm start
```

- Web: `http://127.0.0.1:4173/`
- API: `http://127.0.0.1:8000/`
- Documentación: `http://127.0.0.1:4173/docs/`

El comando carga `.env` solo para el proceso del backend y mantiene los tres
servicios en una terminal. Presiona `Ctrl + C` para cerrarlos juntos. Antes de
arrancar puedes comprobar dependencias y puertos disponibles:

```powershell
pnpm start:check
```

## Voz Realtime opcional

La demo determinista funciona sin credenciales. Para probar voz real, define `OPENAI_API_KEY` únicamente en el proceso del backend:

```powershell
$env:OPENAI_API_KEY="<tu clave local>"
.\.venv\Scripts\python.exe -m uvicorn speakflow_api.main:app --app-dir apps/api/src --reload --port 8000
```

También puedes copiar `.env.example` a `.env` y arrancar Uvicorn con `--env-file .env`. No uses prefijos `VITE_` ni escribas la clave en archivos del frontend. Consulta [Voz en tiempo real](../REALTIME_VOICE.md) para conocer el flujo WebRTC, límites y recuperación.

## Base de datos

```text
python -m alembic -c apps/api/alembic.ini upgrade head
```

La configuración predeterminada crea `data/speakflowai-dev.db`. Puedes cambiarla mediante `SPEAKFLOW_DATA_DIR` o `SPEAKFLOW_DATABASE_URL`. La base y sus archivos auxiliares están ignorados por Git.

La migración actual crea perfiles, sesiones y feedback. La transcripción de texto
solo se persiste si se activa el consentimiento en Preferencias; el audio nunca se
guarda. Consulta [Feedback y retención](../FEEDBACK_AND_RETENTION.md).

## Validación enfocada

Frontend o paquete TypeScript:

```text
pnpm --filter <paquete> lint
pnpm --filter <paquete> typecheck
pnpm --filter <paquete> test
```

Backend:

```text
python -m ruff check apps/api
python -m mypy apps/api/src
python -m pytest apps/api/tests
```

## Validación de cierre

```text
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Luego ejecuta la validación backend anterior. Las suites de mutación, fuzzing, rendimiento, resiliencia, compatibilidad y seguridad completa permanecen diferidas a Fase 6.

# SpeakFlowAI API

Backend FastAPI y límites de aplicación/persistencia.

Desde la raíz:

```powershell
.\.venv\Scripts\python.exe -m uvicorn speakflow_api.main:app --app-dir apps/api/src --reload --port 8000
```

Health: `GET http://127.0.0.1:8000/api/v1/health`.

Migraciones:

```powershell
.\.venv\Scripts\python.exe -m alembic -c apps/api/alembic.ini upgrade head
.\.venv\Scripts\python.exe -m alembic -c apps/api/alembic.ini downgrade -1
```

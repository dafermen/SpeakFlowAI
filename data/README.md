# Datos locales

Este directorio contendrá la base SQLite local del MVP. La base, archivos WAL/SHM, backups y exportaciones no se versionan.

La ruta se configura mediante `SPEAKFLOW_DATA_DIR` o `SPEAKFLOW_DATABASE_URL`.

Crear/actualizar el esquema desde la raíz:

```powershell
.\.venv\Scripts\python.exe -m alembic -c apps/api/alembic.ini upgrade head
```

Para reiniciar desarrollo, detén la API, confirma la ruta configurada, respalda lo necesario, elimina únicamente la base local dentro de `data/` y vuelve a ejecutar la migración. Nunca automatices el borrado sin validar la ruta absoluta.

Nunca coloques aquí datos reales destinados a ejemplos públicos.

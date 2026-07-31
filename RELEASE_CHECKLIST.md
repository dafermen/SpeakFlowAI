# Checklist de release 1.0.0

## Automatizado

- [x] Formato, lint y tipos.
- [x] Pruebas backend y TypeScript.
- [x] Migraciones reversibles.
- [x] Builds web, documentación y Android debug.
- [x] Auditoría de dependencias y búsqueda de secretos.
- [x] Presupuestos de bundle y configuración nativa.
- [x] Workflow de GitHub Pages y rollback documentado.

## Requiere entorno externo

- [ ] Validar audio real con `OPENAI_API_KEY` local.
- [ ] Compilar y firmar iOS en macOS/Xcode.
- [ ] Ejecutar matriz física Android/iOS y lector de pantalla.
- [ ] Configurar backend HTTPS y `VITE_API_BASE_URL` para distribución.
- [ ] Crear o conectar repositorio remoto público.
- [ ] Habilitar GitHub Pages con GitHub Actions.
- [ ] Crear tag `v1.0.0` y publicar estas release notes.

## Rollback

1. En GitHub Pages, vuelve a ejecutar el workflow desde el último commit bueno o
   revierte el commit defectuoso y espera el despliegue.
2. En backend, despliega la imagen anterior y ejecuta `alembic downgrade` solo si
   la migración correspondiente declara una reversión segura.
3. Revoca inmediatamente cualquier credencial expuesta antes de retirar contenido.
4. Conserva evidencia mínima y documenta el incidente sin copiar datos sensibles.

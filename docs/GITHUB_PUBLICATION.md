# Preparación para GitHub público

## Estado de versión 1.0

**Contenido publicado en `dafermen/SpeakFlowAI`.** La entrega usa ejemplos y
capturas sintéticas, incluye licencia y políticas, y pasó las revisiones
automatizadas y manuales de Fase 8 y M1-T18. El workflow de GitHub Pages es
manual: antes de ejecutarlo hay que habilitar **GitHub Actions** como origen en
la configuración del repositorio.

## Contenido prohibido

- claves, tokens, archivos `.env` reales o credenciales;
- audio y transcripciones personales;
- nombres, IP, dispositivos, tickets o procedimientos de empleadores;
- información propietaria o confidencial;
- activos comerciales sin licencia;
- capturas con datos reales;
- bases SQLite de ejecución, WAL, SHM o backups;
- logs con prompts, transcripciones o errores del proveedor sin sanitizar.

Todos los ejemplos usan compañías, instalaciones, personas, incidentes e identificadores ficticios.

## Controles desde el inicio

- `.gitignore` cubre secretos, datos de ejecución, builds y editores.
- `.env.example` contiene solo nombres y valores seguros.
- licencia MIT.
- `SECURITY.md`, `CONTRIBUTING.md` y `CODE_OF_CONDUCT.md`.
- plantillas de issue y pull request.
- inventario de licencias de terceros actualizado con dependencias.
- datos demo sintéticos revisados.
- PR exige declarar impacto en privacidad y documentación.

## Checklist antes de cada publicación

- [x] Buscar patrones de secretos y archivos sensibles en todo el historial a publicar.
- [x] Revisar nombres propios, dominios, IP, IDs, tickets y metadatos de capturas.
- [x] Confirmar que ninguna base de datos o archivo auxiliar está rastreado.
- [x] Revisar licencias de dependencias y activos.
- [x] Ejecutar build reproducible y puerta completa de calidad.
- [x] Ejecutar tests correspondientes a la versión.
- [x] Revisar documentación, enlaces y base path.
- [x] Confirmar que ejemplos y screenshots son sintéticos.
- [x] Documentar variables de entorno sin valores reales.
- [x] Revisar changelog, políticas y responsable de seguridad.

## GitHub Pages

GitHub Pages puede alojar:

- el sitio estático de VitePress;
- opcionalmente el frontend estático si se configura contra un backend externo seguro.

GitHub Pages no puede alojar:

- FastAPI;
- SQLite con escrituras de backend;
- claves privadas de OpenAI;
- inicialización segura de sesiones de voz.

La documentación y el backend se despliegan como unidades separadas aunque compartan dominio mediante routing externo.

## Automatización incluida

- CI rápida: formato, lint, tipos, pruebas y builds.
- Dependabot para los manifests de dependencias.
- CodeQL/análisis de dependencias y secret scanning según disponibilidad.
- Workflow manual de Pages en `.github/workflows/pages.yml`; no intenta publicar
  hasta que Pages esté habilitado expresamente.
- Workflow de release solo cuando haya artefactos versionados.

No se crean workflows que simulen una validación inexistente.

## Capturas y portfolio

- Las capturas versionadas están en `docs/assets/screenshots/`.
- El perfil “Alex” y todas las sesiones son ficticios.
- Relojes, redes y notificaciones del dispositivo recortados cuando puedan identificar.
- Sin logos o UI copiados de aplicaciones comerciales.
- Texto alternativo para imágenes.
- Video demo con guion y voz/activos con derechos claros.

## Respuesta a una exposición accidental

1. Revocar primero el secreto o acceso.
2. Retirar el contenido del estado publicado.
3. Evaluar si el historial debe reescribirse con coordinación explícita.
4. Documentar alcance sin repetir el secreto.
5. Añadir control preventivo.

No basta con borrar un secreto del último commit.

## Criterio de aprobación pública

La Fase 8 y M1-T18 confirmaron cero credenciales reales detectadas, cero
vulnerabilidades conocidas en `pnpm audit`, licencias compatibles, documentación
construible, datos sintéticos y políticas vigentes. El contenido está aprobado
para publicarse en `https://github.com/dafermen/SpeakFlowAI`.

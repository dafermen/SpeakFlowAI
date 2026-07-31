# Preparación para GitHub público

## Estado de versión 1.0

**Contenido aprobado para publicación; repositorio remoto aún no conectado.** La
entrega usa ejemplos sintéticos, incluye licencia y políticas, y pasó las
revisiones automatizadas y manuales de Fase 8. Publicar en GitHub requiere elegir
o crear el repositorio remoto y habilitar Pages con GitHub Actions.

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

- [ ] Buscar patrones de secretos y archivos sensibles en todo el historial a publicar.
- [ ] Revisar nombres propios, dominios, IP, IDs, tickets y metadatos de capturas.
- [ ] Confirmar que ninguna base de datos o archivo auxiliar está rastreado.
- [ ] Revisar licencias de dependencias y activos.
- [ ] Ejecutar build reproducible desde un clon limpio.
- [ ] Ejecutar tests correspondientes a la fase.
- [ ] Revisar documentación, enlaces y base path.
- [ ] Confirmar que ejemplos y screenshots son sintéticos.
- [ ] Documentar variables de entorno sin valores reales.
- [ ] Revisar changelog, políticas y responsable de seguridad.

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
- Workflow de Pages en `.github/workflows/pages.yml`.
- Workflow de release solo cuando haya artefactos versionados.

No se crean workflows que simulen una validación inexistente.

## Capturas y portfolio

- Perfiles y sesiones ficticios.
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

La Fase 8 confirmó cero credenciales reales detectadas, licencias compatibles,
documentación construible, datos sintéticos y políticas vigentes. El estado es
“aprobado para publicar; falta conectar el destino externo”.

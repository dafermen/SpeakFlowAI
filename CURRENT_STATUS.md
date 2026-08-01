# Estado actual

## Fase activa

**MVP 1.0 completado**

Las Fases 0 a 8 están completas. La prueba con proveedor real, la firma iOS y
la publicación pública en GitHub siguen como validaciones externas que no
invalidan la entrega reproducible.

## Estado de calidad

- Alcance y ausencia de autenticación: verificados documentalmente.
- SQLite y portabilidad PostgreSQL: definidos.
- LocalStorage/SQLite/JSON/memoria: límites definidos.
- UX y responsive: flujos, estados, tablas y criterios definidos.
- VitePress/GitHub Pages: decisión aceptada.
- Seguridad pública: políticas y checklist creados.
- Validación de Markdown/enlaces/consistencia: completada sin bloqueos.

## Puerta de fase

La puerta final de Fase 8 está aprobada.

## Tarea activa

**Ninguna. M1-T04 está completada.**

La transcripción visible prioriza ahora el inglés con `gpt-4o-transcribe`,
contexto por escenario, reducción de ruido de campo lejano y VAD ajustado. La
interfaz conserva el inglés normal y pide repetir si el proveedor devuelve un
alfabeto incompatible con la práctica.

La voz real fue validada por el usuario. El cliente de datos ahora invoca `fetch`
con el contexto global, la base SQLite de la raíz tiene las cuatro migraciones y
las rutas relativas se resuelven desde el repositorio aunque la API se inicie
desde otra carpeta.

La causa raíz era invocar `window.fetch` como propiedad de la clase WebRTC. En
Chrome esto cambia su receptor y produce `TypeError: Illegal invocation` antes
de crear una solicitud de red. El cliente ahora ejecuta `fetch` con el contexto
global del navegador y conserva los diagnósticos de micrófono y negociación.

El cliente concede cuatro segundos de recuperación a una desconexión WebRTC
transitoria y reserva el error inmediato para una conexión realmente fallida.
Los errores del proveedor se agrupan en mensajes seguros y accionables.

La autenticación real, el acceso a `gpt-realtime-2.1-mini`, la negociación SDP
y el canal WebRTC `connected/open` están aprobados. La comprobación audible de
audio-in/audio-out permanece como validación manual. La clave debe seguir
únicamente en FastAPI y nunca compartirse en el chat ni escribirse en frontend.

## Registro de validación

Mantenimiento M1-T01 del 2026-07-31:

- Credencial, modelo, negociación SDP y canal de datos: aprobados.
- Audio sintético enviado por WebRTC y respuesta de voz/transcripción: aprobados.
- Cliente web: 10 pruebas aprobadas; lint y tipos aprobados.
- Build de producción y presupuesto de bundle: aprobados.
- No se persistió audio ni se expuso la clave del backend.

Mantenimiento M1-T02 del 2026-07-31:

- Reproducción mínima: `fetch` directo 200 y llamada sin contexto `Illegal invocation`.
- Micrófono presente, servicios de audio activos y privacidad habilitada.
- Errores de micrófono, API y negociación clasificados sin datos sensibles.
- Fallback automático de restricciones avanzadas a captura básica.
- Prueba completa de la interfaz en Chrome: `OPTIONS` 200, `POST` 200 y estado `Escuchando`.
- Cliente web: 14 pruebas aprobadas; lint, tipos, build y bundle aprobados.
- Audio personal: no grabado ni persistido.

Mantenimiento M1-T03 del 2026-07-31:

- Conversación de voz real y revisión local: confirmadas por el usuario.
- Cliente API: contexto global de `fetch` aplicado a perfiles, sesiones y progreso.
- SQLite raíz: migraciones `0001` a `0004` aplicadas; progreso responde 200.
- Chrome con cliente API real: `RESULT=ok sessions=0`.
- Cliente API: 5 pruebas; web: 14 pruebas; backend: 21 pruebas aprobadas.
- Ruff, formato Python, mypy, lint, tipos, builds y bundle: aprobados.
- La sesión que originó el aviso quedó como copia local; no se fabricaron datos para reemplazarla.

Mantenimiento M1-T04 del 2026-07-31:

- La captura reportada contenía una frase en turco y otra en escritura coreana.
- Transcripción: inglés explícito, vocabulario por escenario y modelo de mayor precisión.
- Audio de entrada: reducción de ruido `far_field`, umbral VAD 0,55 y silencio de 750 ms.
- Interfaz: alfabetos incompatibles se reemplazan por una indicación para repetir.
- Backend: 22 pruebas; ruff, formato y mypy aprobados.
- Web: 15 pruebas; Prettier, ESLint, tipos, build y bundle aprobados.
- Documentación VitePress: build aprobado.
- Chrome con audio simulado: sesión Realtime real aceptada por OpenAI (`PASS`).
- No se usó, grabó ni persistió la voz de la persona usuaria.

Auditoría de Fase 0 del 2026-07-30:

- 0 archivos requeridos ausentes.
- 0 enlaces Markdown locales rotos.
- 0 bloques de código desbalanceados.
- 0 documentos de diseño vacíos.
- 0 referencias al nombre anterior del proyecto.
- 0 patrones de secretos detectados.
- 0 implementaciones de aplicación de producción.
- Las reglas `.gitignore` cubren `.env`, SQLite y archivos auxiliares.
- Las plantillas YAML se revisaron estructuralmente; su validación contra GitHub se integrará con CI en Fase 1.

Puerta de Fase 1 del 2026-07-31:

- Formato: aprobado.
- Lint TypeScript y Python: aprobado.
- Tipos TypeScript y mypy estricto: aprobados.
- Pruebas TypeScript: 10 aprobadas.
- Pruebas backend: 3 aprobadas, incluida migración Alembic reversible.
- Dependencias Python: sin incompatibilidades.
- Build React: aprobado.
- Build VitePress, enlaces y Mermaid: aprobado.
- YAML de GitHub: 5 archivos válidos.
- Patrones de secretos, nombre anterior y enlaces locales rotos: 0.
- Espejo de entrega y proyecto definitivo: 0 diferencias.

Puerta de Fase 2 del 2026-07-31:

- Onboarding accesible, persistente y reanudable: aprobado.
- Perfil SQLite, repositorio y migración Alembic reversible: aprobados.
- Home, preferencias, tema y recuperación ante API inactiva: aprobados.
- Cuatro modos y escenarios JSON validados: aprobados.
- Setup y tutor determinista local end-to-end: aprobados.
- Lint y tipos TypeScript/Python: aprobados.
- Pruebas TypeScript: 15 aprobadas.
- Pruebas backend: 4 aprobadas.
- Builds React y VitePress: aprobados.
- Revisión visual móvil y escritorio: aprobada, sin desbordamientos.

Validación parcial de Fase 3 del 2026-07-31:

- Contrato oficial WebRTC/unified interface y coste: verificados.
- Clave estándar confinada al backend: verificado.
- SDP, escenario, voz, velocidad y tamaño: validados en servidor.
- Límites de inicio, duración y salida: implementados.
- Estados, subtítulos, pausa, silencio, repetición, velocidad y reconexión: implementados.
- Fallback determinista ante voz no configurada: implementado.
- Lint y tipos TypeScript/Python: aprobados.
- Pruebas TypeScript acumuladas: 19 aprobadas.
- Pruebas backend acumuladas: 7 aprobadas.
- Builds React y VitePress: aprobados.
- Proveedor real: autenticación, modelo, SDP y data channel aprobados el 2026-07-31.
- Audio-in/audio-out audible: pendiente de comprobación manual con micrófono.

Puerta de Fase 4 del 2026-07-31:

- Sesiones, feedback y métricas persistentes: aprobados.
- Retención de transcripción por consentimiento: aprobada; audio no persistido.
- Revisión responsive con fallback y reintento: aprobada.
- Ruff, mypy, lint y tipos TypeScript: aprobados.
- Pruebas TypeScript acumuladas: 21 aprobadas.
- Pruebas backend acumuladas: 11 aprobadas.
- Builds React y VitePress: aprobados.

Puerta de Fase 5 del 2026-07-31:

- Historial y agregados sin retención de texto: aprobados.
- Dashboard responsive y Home con progreso real: aprobados.
- Estados vacío, carga, fallo y reintento: aprobados.
- Guía de uso, troubleshooting, búsqueda y navegación: aprobados.
- Ruff, mypy, lint y tipos TypeScript: aprobados.
- Pruebas backend acumuladas: 11 aprobadas.
- Pruebas TypeScript acumuladas: 22 aprobadas.
- Builds React y VitePress: aprobados.

Puerta de Fase 6 del 2026-07-31:

- Fronteras HTTP, cabeceras, request ID y logs sanitizados: aprobados.
- Fuzz determinista de 200 entradas y contrato OpenAPI: aprobados.
- Resiliencia offline y límites de coste/configuración: aprobados.
- Pruebas backend acumuladas: 19 aprobadas.
- Pruebas TypeScript acumuladas: 24 aprobadas.
- Auditoría Node: 0 vulnerabilidades conocidas; `pip check`: aprobado.
- Bundle web dentro de 400 kB JS / 60 kB CSS.
- Backend in-process p95: 5,066 ms sobre 500 solicitudes.

Puerta de Fase 7 del 2026-07-31:

- Capacitor 8.4.2, Android e iOS generados y sincronizados.
- Permisos de micrófono y pausa al entrar en background: aprobados.
- Android doctor y APK debug: aprobados.
- Backend: 20 pruebas; web: 8 pruebas; tipos y build: aprobados.
- iOS Xcode/firma: pendiente externa por requerir macOS.

Puerta de Fase 8 del 2026-07-31:

- Versión 1.0.0 alineada en API, web, documentación y paquetes compartidos.
- Tarjeta social original, caso de estudio, guion de demo y notas de release: aprobados.
- Licencias de producción: inventariadas; `khroma` verificado manualmente como MIT.
- Formato, lint y tipos TypeScript/Python: aprobados.
- Pruebas backend: 20 aprobadas; pruebas TypeScript: 24 aprobadas.
- Builds web y VitePress: aprobados; bundle web dentro del presupuesto.
- Auditoría Node: 0 vulnerabilidades conocidas; `pip check`: aprobado.
- Escaneo final: 0 credenciales reales; solo un ejemplo explícito de placeholder.
- Workflow de GitHub Pages, rollback y paquete de hosting privado: preparados.

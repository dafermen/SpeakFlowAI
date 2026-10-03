# Estado actual

## Documentation web navigation v1 — local candidate, 2026-10-03

InnovaLogic documentation theme, reading paths and reading controls are implemented. Documentation typecheck, lint and build; browser at 1440 and 390 px. See [navigation maintenance and evidence](docs/WEB_NAVIGATION.md). GitHub and server delivery of this revision are pending; earlier deployment status below remains historical evidence.

## Documentation navigation v1 — 2026-10-03

Completed locally: InnovaLogic theme tokens, three reading paths and keyboard-accessible image enlargement. Existing VitePress search, sidebar, table of contents, page navigation and public routes are preserved. Local browser validation passes at 1440 and 390 px; no server release is claimed.

## Fase activa

**MVP 1.0 completado**

Las Fases 0 a 8 están completas. La prueba con proveedor real y la firma iOS
siguen como validaciones externas que no invalidan la entrega reproducible. El
repositorio público está preparado en `dafermen/SpeakFlowAI`.

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

**Sin tarea de desarrollo activa. M1-T18 completada; pendiente revisión humana.**

El repositorio público indicado por la persona usuaria quedó conectado a
`https://github.com/dafermen/SpeakFlowAI`. La versión estable incluye capturas
reales con el perfil ficticio “Alex”, dependencias actualizadas y documentación
de instalación, arquitectura, seguridad y uso.

`httpx2` forma parte del entorno de desarrollo requerido por Starlette,
mientras `httpx` permanece en producción para el adaptador de OpenAI. La
documentación ya distingue las pruebas automatizadas de la validación manual de
voz y no conserva advertencias resueltas de Mermaid o `TestClient`.

La documentación carga Mermaid únicamente al abrir una página con diagramas. El
componente local muestra estados comprensibles, conserva tema claro/oscuro y
asigna a cada gráfico una etiqueta accesible basada en el encabezado anterior.

Los documentos movidos accidentalmente regresaron a sus ubicaciones registradas
sin pérdida de contenido. `pnpm start` inicia web, API y documentación desde una
sola terminal, con la web en el puerto `4173`.

VitePress interceptaba el enlace `/` como una ruta interna y el clic no salía
del sitio documental. El enlace forzará navegación nativa en la misma pestaña,
conservando la ruta de destino y la accesibilidad existentes.

La navegación documental incorpora un enlace “Volver a la aplicación” con ruta
directa al inicio de SpeakFlowAI. El control tendrá presentación adecuada tanto
en la barra de escritorio como en el menú móvil.

La ruta `/docs/` respondía HTTP 200, pero VitePress no hidrataba la página en
Chrome debido al módulo de desarrollo generado con una ruta local de Windows.
La solución sirve la compilación estática y corrige el nivel duplicado
`/docs/docs/` sin modificar el contenido documental.

La corrección impide que eco o ruido detectado durante la voz del tutor cancele
automáticamente su respuesta. La interrupción intencional permanece disponible
mediante un control explícito que cancela generación y audio pendiente.

El código de producción está documentado para lectura educativa: backend,
contratos compartidos, adaptadores, React, WebRTC y estilos. El recorrido guiado
conecta interfaz, API, dominio y persistencia mediante mapas y flujos concretos.

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

Mantenimiento M1-T18 del 2026-10-01:

- El historial y los archivos rastreados no contienen claves, tokens, bases de
  datos ni archivos `.env`; las cuatro coincidencias genéricas revisadas son
  lectura de configuración, un valor de prueba y marcadores documentales.
- `pnpm audit` informa cero vulnerabilidades conocidas después de actualizar
  React, Vite, Capacitor y herramientas compatibles, y resolver `uuid` 11.1.1
  en la cadena de Xcode.
- 41 pruebas TypeScript y 23 pruebas backend aprobadas; también pasaron formato,
  lint, tipos, Ruff, mypy, `pip check`, builds, presupuestos y configuración
  nativa.
- Cinco capturas reales y reproducibles fueron revisadas visualmente. Usan datos
  sintéticos, no muestran elementos del navegador y cubren escritorio y móvil.
- El workflow de Pages queda manual porque el repositorio aún no tiene ese
  servicio habilitado; no se activó un despliegue externo sin autorización.
- Se excluyeron por instrucción explícita las pruebas físicas de dispositivos,
  la compilación/firma iOS y la creación de tag o release.

Mantenimiento M1-T17 del 2026-10-01:

- Starlette 1.3.1 usa `httpx2` 2.13.1 para `TestClient` sin advertencias de
  deprecación; `httpx` 0.28.1 permanece aislado en el adaptador de OpenAI.
- La evidencia de voz reconoce la validación manual de audio bidireccional ya
  realizada y conserva fuera de automatización únicamente la prueba con coste.
- El informe de calidad registra la carga diferida y el presupuesto de Mermaid.
- Backend: 23 pruebas aprobadas; Ruff, formato, mypy estricto y `pip check`
  aprobados.

Mantenimiento M1-T16 del 2026-09-09:

- Mermaid dejó de formar parte del archivo de entrada documental: pasó de
  aproximadamente 624 kB a 1,3 kB y se carga solo donde existe un diagrama.
- La portada carga 170.437 bytes de JavaScript y 108.027 bytes de CSS; un
  presupuesto automatizado evita futuras regresiones y la precarga de Mermaid.
- Los diagramas tienen estados accesibles de carga/error y una etiqueta derivada
  del encabezado de su sección.
- Chrome renderizó un SVG real sin estado pendiente ni error y confirmó la
  etiqueta contextual accesible.
- Prettier, ESLint, tipos, pruebas, build VitePress y presupuesto: aprobados.

Mantenimiento M1-T15 del 2026-09-09:

- Diecinueve documentos movidos por accidente regresaron a la raíz y
  `docs/README.md` fue restaurado; Git no conserva eliminaciones ni duplicados.
- `pnpm start` administra React/Vite `4173`, FastAPI `8000` y VitePress `5174`
  desde una sola terminal; `Ctrl + C` cierra el conjunto.
- `.env` se carga únicamente en el backend y sus valores nunca se imprimen.
- `pnpm start:check` valida entorno y puertos antes de iniciar.
- Web, API y documentación respondieron HTTP 200; voz Realtime disponible.
- Script Node, Prettier, ESLint, tipos y build VitePress: aprobados.

Mantenimiento M1-T14 del 2026-08-01:

- El enlace de regreso usa navegación nativa en la misma pestaña y ya no es
  interceptado por el enrutador documental de VitePress.
- Chrome pulsó automáticamente el control desde `/docs/ARCHITECTURE` y terminó
  en `/`; la validación end-to-end fue aprobada.
- Prettier, ESLint, tipos y build VitePress: aprobados.

Mantenimiento M1-T13 del 2026-08-01:

- La barra de escritorio muestra “← Volver a la aplicación”.
- El menú móvil incluye el mismo enlace con un objetivo táctil de 44 px.
- Ambos controles usan `href="/"`, por lo que regresan al inicio en local y en
  despliegues del mismo dominio.
- El inicio de la aplicación responde HTTP 200 y Chrome renderiza el enlace con
  una etiqueta accesible.
- Prettier, ESLint, tipos y build VitePress: aprobados; 0 enlaces muertos.

Mantenimiento M1-T12 del 2026-08-01:

- VitePress sirve ahora su compilación estática en desarrollo local, evitando el
  módulo con ruta de Windows que Chrome no podía ejecutar.
- La reescritura aplana la carpeta fuente `docs` y elimina las rutas duplicadas
  `/docs/docs/`.
- Navegación, portada y diez enlaces relativos se ajustaron a la base pública.
- `/docs/`, `/docs/PRODUCT` y el JavaScript principal responden HTTP 200 a través
  del puerto `4173`.
- Chrome renderizó título, navegación y enlaces sin duplicación en una prueba
  automatizada con el navegador real.
- Prettier, ESLint, tipos y build VitePress: aprobados; 0 enlaces muertos.

Mantenimiento M1-T11 del 2026-08-01:

- El VAD conserva la creación automática de turnos y desactiva la interrupción
  automática provocada por eco o ruido.
- El control Pausar cambia a “Interrumpir” mientras habla el tutor y cancela
  generación y audio pendiente de forma deliberada.
- La interfaz vuelve a escucha cuando OpenAI confirma que el búfer fue detenido
  o vaciado.
- Frontend: Prettier, ESLint, tipos, 24 pruebas, build, bundle y configuración
  nativa aprobados.
- Backend: formato, Ruff, mypy y 23 pruebas aprobados.

Mantenimiento M1-T10 del 2026-08-01:

- Favicon SVG, fallback ICO, PNG de 32 px e icono Apple de 180 px creados.
- Símbolo de tres ondas verificado visualmente a tamaño completo y 32 × 32.
- HTML enlaza explícitamente los formatos y evita la solicitud 404 anterior.
- Generador PowerShell reproducible basado en los colores oficiales de la marca.
- Prettier, build web y presupuesto de bundle: aprobados.
- Los cuatro recursos responden HTTP 200 con su tipo de contenido correcto en `4173`.

Mantenimiento M1-T09 del 2026-08-01:

- Chat anclado al final, seguimiento automático respetuoso y botón “Volver al final”.
- Barra de desplazamiento discreta y comportamiento compartido por voz y práctica escrita.
- Diagnóstico previo de navegador, red, API y disponibilidad de voz sin abrir el micrófono.
- Estados humanos; WebRTC y tokens trasladados a “Detalles técnicos”.
- Inicio recomendado según historial y última elección, con acceso directo a preparación.
- Revisión con siguiente escenario, repetición, copia y pronunciación local de frases.
- Transcripciones incorrectas excluibles de la revisión y progreso expresado como constancia.
- Frontend: formato, ESLint, tipos, 23 pruebas, build y presupuesto de bundle aprobados.
- Backend: formato, Ruff, mypy y 23 pruebas aprobados.
- API de disponibilidad segura activa; aplicación `4173` y API `8000` operativas.

Mantenimiento M1-T08 del 2026-08-01:

- `App.tsx` pasó de aproximadamente 1.900 líneas a 380 líneas de orquestación.
- Siete módulos nuevos separan contratos, componentes comunes y pantallas por responsabilidad.
- Cada módulo de interfaz tiene menos de 400 líneas y documentación orientada a estudiantes.
- Formato, ESLint, tipos, 15 pruebas web, build y presupuesto de bundle: aprobados.
- VitePress construyó correctamente el recorrido educativo actualizado.
- No se modificaron contratos HTTP, datos persistidos, privacidad ni comportamiento visible.

Mantenimiento M1-T05 del 2026-08-01:

- Estándar educativo creado y enlazado desde la navegación documental.
- 25 módulos Python cubiertos en dominio, aplicación, API e infraestructura.
- Funciones importantes: propósito, entradas, salidas, errores y efectos documentados.
- Ruff, formato, mypy y las 22 pruebas backend: aprobados.
- No se modificó comportamiento de producción ni esquema de base de datos.

Mantenimiento M1-T06 del 2026-08-01:

- TSDoc añadido al cliente HTTP, preferencias, esquemas JSON y sistema de diseño.
- Servicios web documentados: catálogo, tutor local, fallback y WebRTC Realtime.
- Contratos, parámetros, resultados, recuperaciones y efectos del navegador explicados.
- Paquetes: 17 pruebas; web enfocada: 10 pruebas; formato, lint y tipos aprobados.
- No se modificaron protocolos, almacenamiento ni comportamiento visible.

Mantenimiento M1-T07 del 2026-08-01:

- `App.tsx`: componentes, estados, callbacks, persistencia y recuperación explicados.
- CSS: tokens, composición responsive y accesibilidad organizados por secciones.
- Recorrido educativo y estándar enlazados desde README, índice y navegación VitePress.
- Backend: 98 clases/funciones y 0 docstrings ausentes según auditoría AST.
- TypeScript de producción: 149 bloques TSDoc en 20 archivos auditados.
- Guías nuevas: 227 líneas entre estándar y recorrido de aprendizaje.
- Backend: 22 pruebas; web: 15 pruebas; paquetes: 17 pruebas aprobadas.
- Formato, Ruff, ESLint, mypy, tipos, builds, bundle y VitePress: aprobados.
- Los cambios son documentales; no alteran comportamiento, datos ni protocolos.

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
- Audio-in/audio-out audible: pendiente en este corte histórico; resuelto
  posteriormente mediante la validación manual de la persona usuaria.

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

## DEMO-ENV-20261002 — Optional portfolio entry gate

The owner authorized publication and test-server deployment of the external demo
gateway and its documentation. `DEMO_MODE=true|false` and private `DEMO_PASSWORD`
are read from a separate server env file, not the root local-development env.
The current test deployment stays protected with the existing keys. The gateway
retains server-side verification, host-bound sessions and native app permissions.
Source, blank template and five passing security/configuration tests are versioned
under `deploy/demo-access`. See `docs/DEMO_MODE.md` and its ADR for operations,
rollback and limits. This documentation release does not accept unrelated tasks,
publish pending app development, enable email invitations or alter pilot expiry.

## DOC-STD-20261002 — Organización documental

El índice existente ahora identifica fuentes canónicas y recorridos de usuario, desarrollo y operación, con acceso desde VitePress. Se corrigió una descripción futura de un portal ya implementado. Se mantienen los límites del modelo personal, la configuración independiente de DEMO_MODE y las validaciones externas pendientes.

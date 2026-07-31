# Feedback y retención de sesiones

## Qué ocurre al terminar

Al finalizar una práctica, la web envía a la API el escenario, modo, nivel,
duración, proveedor, métricas de tokens y los turnos necesarios para elaborar la
revisión. La API genera feedback estructurado y guarda la sesión en SQLite.

La revisión incluye:

- resumen de la práctica;
- fortaleza principal y siguiente área de enfoque;
- hasta tres correcciones explicadas;
- vocabulario contextual;
- frases reutilizables;
- observaciones de fluidez y siguiente paso.

El generador actual es determinista. Esto permite probar el flujo completo sin
una credencial externa y establece un contrato estable para incorporar análisis
asistido por IA más adelante.

## Privacidad por defecto

SpeakFlowAI nunca persiste el audio. La sesión, sus métricas y el feedback sí se
guardan para habilitar progreso e historial, pero la transcripción cruda se
descarta después de generar la revisión.

La persona puede activar **Guardar transcripciones de práctica** en Preferencias.
Solo entonces los turnos de texto se almacenan en `session_turns`. La preferencia
es local, versionada y está desactivada por defecto, incluso al migrar datos de
versiones anteriores.

## Resiliencia

Si la API local no responde, la web muestra inmediatamente una revisión de
respaldo y conserva el envío en memoria para reintentarlo durante la vista actual.
La interfaz distingue claramente una sesión **Guardada** de una **Copia local**.

## Contratos de API

- `POST /api/v1/sessions`: cierra una sesión, genera feedback y la persiste.
- `GET /api/v1/sessions/{id}`: recupera la revisión persistida.

Las entradas están acotadas a 60 turnos, 2.000 caracteres por turno, 15 minutos
y un millón de tokens por dirección. Los identificadores y enums se validan en
el límite HTTP.

## Modelo de datos

`practice_sessions` es la raíz. `session_feedback` mantiene una relación uno a
uno y enlaza correcciones, vocabulario, frases mejoradas y observaciones. Los
turnos tienen orden estable y solo existen con consentimiento. Todas las claves
foráneas eliminan dependencias en cascada.

# Tareas secuenciales

Estados: `DONE`, `IN_PROGRESS`, `READY`, `LOCKED`.

## Fase 0 - Definición

| Orden | ID     | Actividad/tarea                                 | Estado |
| ----: | ------ | ----------------------------------------------- | ------ |
|     1 | P0-T01 | Definir producto, usuario, valor y éxito        | DONE   |
|     2 | P0-T02 | Fijar alcance incluido/excluido                 | DONE   |
|     3 | P0-T03 | Describir recorridos e información              | DONE   |
|     4 | P0-T04 | Definir arquitectura y confianza                | DONE   |
|     5 | P0-T05 | Definir SQLite y migración PostgreSQL           | DONE   |
|     6 | P0-T06 | Definir LocalStorage y JSON                     | DONE   |
|     7 | P0-T07 | Definir ejecución de pruebas                    | DONE   |
|     8 | P0-T08 | Definir onboarding, Home, setup, voz y revisión | DONE   |
|     9 | P0-T09 | Definir responsive, visual y accesibilidad      | DONE   |
|    10 | P0-T10 | Seleccionar documentación y Pages               | DONE   |
|    11 | P0-T11 | Preparar seguridad pública y gobernanza         | DONE   |
|    12 | P0-T12 | Crear ADR y trazabilidad                        | DONE   |
|    13 | P0-T13 | Auditar consistencia y cerrar Fase 0            | DONE   |

## Fase 1 - Fundación

| Orden | ID     | Actividad/tarea                            | Estado |
| ----: | ------ | ------------------------------------------ | ------ |
|     1 | P1-T01 | Inicializar monorepo y límites de paquetes | DONE   |
|     2 | P1-T02 | Crear fundamentos React y FastAPI          | DONE   |
|     3 | P1-T03 | Configurar SQLite, SQLAlchemy y Alembic    | DONE   |
|     4 | P1-T04 | Implementar adaptador LocalStorage tipado  | DONE   |
|     5 | P1-T05 | Implementar schemas/validador JSON         | DONE   |
|     6 | P1-T06 | Implementar tokens y UI base               | DONE   |
|     7 | P1-T07 | Implementar shell responsive               | DONE   |
|     8 | P1-T08 | Crear VitePress y navegación inicial       | DONE   |
|     9 | P1-T09 | Configurar CI rápida                       | DONE   |
|    10 | P1-T10 | Ejecutar puerta de cierre de Fase 1        | DONE   |

## Fase 2 - Experiencia local

| Orden | ID     | Actividad/tarea                                     | Estado |
| ----: | ------ | --------------------------------------------------- | ------ |
|     1 | P2-T01 | Implementar onboarding local accesible y reanudable | DONE   |
|     2 | P2-T02 | Crear perfil local y persistencia por repositorio   | DONE   |
|     3 | P2-T03 | Integrar preferencias y temas                       | DONE   |
|     4 | P2-T04 | Implementar Home y recomendación inicial            | DONE   |
|     5 | P2-T05 | Crear modos, escenarios y carga JSON                | DONE   |
|     6 | P2-T06 | Implementar preparación de sesión                   | DONE   |
|     7 | P2-T07 | Implementar tutor falso determinista                | DONE   |
|     8 | P2-T08 | Ejecutar puerta de cierre de Fase 2                 | DONE   |

## Fase 3 - Voz en tiempo real

| Orden | ID     | Actividad/tarea                                       | Estado |
| ----: | ------ | ----------------------------------------------------- | ------ |
|     1 | P3-T01 | Verificar contrato Realtime actual y modelo de coste  | DONE   |
|     2 | P3-T02 | Implementar inicialización WebRTC mediada por backend | DONE   |
|     3 | P3-T03 | Crear adaptador de voz y estados de conexión          | DONE   |
|     4 | P3-T04 | Integrar micrófono, audio, subtítulos y controles     | DONE   |
|     5 | P3-T05 | Implementar reconexión y recuperación de errores      | DONE   |
|     6 | P3-T06 | Aplicar límites de duración, turnos y salida          | DONE   |
|     7 | P3-T07 | Validar navegador móvil y contratos sin credencial    | DONE   |
|     8 | P3-T08 | Ejecutar puerta de cierre de Fase 3                   | DONE   |

La autenticación, el acceso al modelo y la conexión WebRTC con el proveedor real
quedaron aprobados el 2026-07-31. La comprobación audible con micrófono continúa
como validación manual y no bloquea el desarrollo posterior.

## Fase 4 - Feedback de aprendizaje

| Orden | ID     | Actividad/tarea                                      | Estado |
| ----: | ------ | ---------------------------------------------------- | ------ |
|     1 | P4-T01 | Diseñar sesiones, turnos y feedback persistente      | DONE   |
|     2 | P4-T02 | Crear migración y repositorio de sesiones            | DONE   |
|     3 | P4-T03 | Implementar generador de feedback determinista       | DONE   |
|     4 | P4-T04 | Crear API de cierre y revisión de sesión             | DONE   |
|     5 | P4-T05 | Integrar cierre de tutor local y voz                 | DONE   |
|     6 | P4-T06 | Implementar pantalla de revisión resiliente          | DONE   |
|     7 | P4-T07 | Aplicar consentimiento de retención de transcripción | DONE   |
|     8 | P4-T08 | Ejecutar puerta de cierre de Fase 4                  | DONE   |

## Fase 5 - Progreso y experiencia documental

| Orden | ID     | Actividad/tarea                                         | Estado |
| ----: | ------ | ------------------------------------------------------- | ------ |
|     1 | P5-T01 | Crear consultas de historial y agregados de progreso    | DONE   |
|     2 | P5-T02 | Exponer API de historial y dashboard                    | DONE   |
|     3 | P5-T03 | Implementar vista de progreso y sesiones recientes      | DONE   |
|     4 | P5-T04 | Conectar Home con progreso real                         | DONE   |
|     5 | P5-T05 | Completar guía de usuario, ayuda y troubleshooting      | DONE   |
|     6 | P5-T06 | Validar accesibilidad, búsqueda y navegación documental | DONE   |
|     7 | P5-T07 | Ejecutar puerta de cierre de Fase 5                     | DONE   |

## Fase 6 - Endurecimiento

| Orden | ID     | Actividad/tarea                                   | Estado |
| ----: | ------ | ------------------------------------------------- | ------ |
|     1 | P6-T01 | Reforzar límites HTTP, cabeceras y observabilidad | DONE   |
|     2 | P6-T02 | Ampliar propiedades, fuzz y contratos             | DONE   |
|     3 | P6-T03 | Añadir pruebas end-to-end del camino crítico      | DONE   |
|     4 | P6-T04 | Medir rendimiento, resiliencia y compatibilidad   | DONE   |
|     5 | P6-T05 | Auditar accesibilidad y seguridad                 | DONE   |
|     6 | P6-T06 | Ejecutar puerta completa y documentar evidencia   | DONE   |

## Fase 7 - Capacitor y móvil

| Orden | ID     | Actividad/tarea                             | Estado |
| ----: | ------ | ------------------------------------------- | ------ |
|     1 | P7-T01 | Inicializar Capacitor sobre el build web    | DONE   |
|     2 | P7-T02 | Crear proyectos Android e iOS               | DONE   |
|     3 | P7-T03 | Configurar permisos, red y lifecycle        | DONE   |
|     4 | P7-T04 | Sincronizar assets y validar proyectos      | DONE   |
|     5 | P7-T05 | Documentar builds y pruebas en dispositivos | DONE   |
|     6 | P7-T06 | Ejecutar puerta de cierre de Fase 7         | DONE   |

## Fase 8 - Publicación y portfolio

| Orden | ID     | Actividad/tarea                                 | Estado |
| ----: | ------ | ----------------------------------------------- | ------ |
|     1 | P8-T01 | Ejecutar auditoría de publicación y licencias   | DONE   |
|     2 | P8-T02 | Preparar identidad visual y social card         | DONE   |
|     3 | P8-T03 | Completar caso de estudio y arquitectura visual | DONE   |
|     4 | P8-T04 | Preparar Pages, release y rollback              | DONE   |
|     5 | P8-T05 | Crear release notes y checklist 1.0             | DONE   |
|     6 | P8-T06 | Ejecutar puerta final y entregar                | DONE   |

## Regla de desbloqueo

Una sola tarea puede estar `IN_PROGRESS`. La siguiente se desbloquea cuando la actual cumple sus criterios.

## Mantenimiento posterior a 1.0

| Orden | ID     | Actividad/tarea                                                          | Estado |
| ----: | ------ | ------------------------------------------------------------------------ | ------ |
|     1 | M1-T01 | Corregir falsos cortes y diagnósticos genéricos en la sesión WebRTC      | DONE   |
|     2 | M1-T02 | Diagnosticar y recuperar fallos previos a la solicitud SDP               | DONE   |
|     3 | M1-T03 | Corregir el contexto de red al guardar sesiones y cargar progreso        | DONE   |
|     4 | M1-T04 | Mejorar la precisión y el control de idioma de la transcripción de voz   | DONE   |
|     5 | M1-T05 | Definir el estándar educativo y documentar el backend Python             | DONE   |
|     6 | M1-T06 | Documentar paquetes TypeScript y servicios del frontend                  | DONE   |
|     7 | M1-T07 | Documentar la interfaz React y crear el recorrido guiado del código      | DONE   |
|     8 | M1-T08 | Dividir el frontend monolítico en módulos educativos por responsabilidad | DONE   |
|     9 | M1-T09 | Mejorar lectura, preparación, aprendizaje y continuidad del recorrido UX | DONE   |

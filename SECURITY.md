# Política de seguridad

## Alcance actual

SpeakFlowAI es un MVP local no desplegado. La voz se media por FastAPI y las
credenciales nunca llegan al frontend. Las sesiones y el feedback se guardan en
SQLite; el audio nunca se persiste y el texto crudo requiere consentimiento.

## Reporte responsable

No abras un issue público con secretos, datos personales o pasos que expongan a usuarios. Hasta definir un canal privado del proyecto, conserva la evidencia de forma segura y contacta al mantenedor por un canal privado conocido. No inventamos una dirección de correo que aún no existe.

## Reglas para colaboradores

- Nunca confirmar claves, tokens, audio, transcripciones o `.env` real.
- Usar datos sintéticos.
- Sanitizar logs y errores.
- Mantener credenciales de OpenAI solo en backend.
- Revisar dependencias y licencias.
- Tratar LocalStorage y el navegador como no confiables.
- Validar entradas en fronteras frontend, API y persistencia.

## Respuesta

Prioridad: revocar/contener, preservar evidencia mínima, corregir, validar y documentar. Un secreto expuesto se considera comprometido aunque se borre del último commit.

## Versiones compatibles

La rama de desarrollo prepara la versión `1.0.0`. No hay aún una distribución
pública soportada. Las vulnerabilidades altas o críticas bloquean el release.

## Controles verificables

- límites de cuerpo, duración, inicios de voz, turnos y tokens;
- errores sanitizados y logs sin cuerpos;
- cabeceras defensivas y correlación por solicitud;
- auditoría de dependencias y presupuesto de bundle en CI;
- búsqueda de secretos y datos de prueba exclusivamente sintéticos;
- evidencia en [docs/QUALITY_REPORT.md](docs/QUALITY_REPORT.md).

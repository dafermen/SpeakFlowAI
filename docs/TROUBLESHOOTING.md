# Solución de problemas

## La voz dice que no está configurada

La API no encontró `OPENAI_API_KEY`. Puedes continuar con **Usar demo local**.
Para habilitar voz real, configura la clave solo en el proceso del backend según
[Preparar el entorno](development/GETTING_STARTED.md#voz-realtime-opcional).

## El navegador rechazó el micrófono

Abre los permisos del sitio, permite el micrófono y usa **Reintentar**. El permiso
solo se solicita después de pulsar **Activar micrófono**.

## La sesión muestra “Copia local”

La práctica terminó, pero la API no respondió al guardado. Confirma que FastAPI
está activo en `http://127.0.0.1:8000` y pulsa **Reintentar guardado** antes de
salir de la revisión.

## Progreso no carga

1. Comprueba que la API esté activa.
2. Ejecuta las migraciones hasta `head`.
3. Recarga **Progreso** o usa **Reintentar**.

El comando de migración está en [Preparar el entorno](development/GETTING_STARTED.md#base-de-datos).

## Las preferencias se restablecieron

SpeakFlowAI recupera valores seguros si encuentra datos dañados o una versión no
compatible en LocalStorage. Completa de nuevo el ajuste afectado. Una versión de
datos futura no se sobrescribe automáticamente.

## La transcripción no aparece en el historial

Es el comportamiento esperado. Los turnos crudos se descartan por defecto y el
historial muestra métricas y feedback. Activa **Guardar transcripciones de
práctica** antes de una sesión si deseas conservar su texto.

## Reiniciar el entorno de desarrollo

Detén los procesos y vuelve a iniciar web, documentación y API usando los comandos
de [Preparar el entorno](development/GETTING_STARTED.md). No elimines la base de
datos si quieres conservar tu historial.

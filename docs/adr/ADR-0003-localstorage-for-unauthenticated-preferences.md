# ADR-0003: LocalStorage para preferencias sin autenticación

- Estado: Aceptada
- Fecha: 2026-07-30

## Contexto

El MVP tiene una persona local sin cuenta y necesita recordar opciones de interfaz antes de contactar al backend.

## Decisión

Usar un único sobre LocalStorage tipado, versionado y validado detrás de `PreferencesStorage`. Guardar solo preferencias pequeñas y no sensibles.

## Consecuencias

- Funciona sin login y con inicio rápido.
- Los datos quedan asociados al navegador y pueden borrarse.
- Corrupción o bloqueo degrada a defaults en memoria.
- Secretos, audio, tokens y transcripciones completas están prohibidos.
- Datos de aprendizaje consultables pertenecen a SQLite.

## Cumplimiento

Pruebas de versión/corrupción, búsqueda de accesos directos y opción de borrado.

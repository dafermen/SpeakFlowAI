# Estrategia de LocalStorage

## Propósito

LocalStorage contiene únicamente preferencias pequeñas, no sensibles y necesarias antes de consultar el backend. Todo acceso pasa por un adaptador tipado; ningún componente usa `window.localStorage` directamente.

## Clave y sobre

Clave propuesta: `speakflow.preferences`

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-07-31T03:00:00Z",
  "data": {
    "interfaceLanguage": "es",
    "englishLevel": "b1",
    "speakingSpeed": "normal",
    "tutorVoiceId": "voice-calm-1",
    "theme": "system",
    "captionsEnabled": true,
    "spanishHelpEnabled": true,
    "onboardingCompleted": true,
    "lastModeId": "mode.conversation",
    "lastScenarioId": "scenario.daily-coffee-shop"
  }
}
```

El timestamp es informativo y no se usa como fuente de verdad del progreso.

## Límites

| LocalStorage          | SQLite                                       | JSON versionado              | Solo memoria                 |
| --------------------- | -------------------------------------------- | ---------------------------- | ---------------------------- |
| idioma de interfaz    | perfil de aprendizaje duradero               | modos y escenarios           | audio y buffers              |
| nivel seleccionado    | sesiones y revisiones                        | lecciones y vocabulario base | token efímero                |
| velocidad y voz       | observaciones y progreso                     | prompts y dificultades       | estado de conexión           |
| tema y subtítulos     | transcripción con consentimiento             | logros y defaults            | texto parcial no confirmado  |
| ayuda en español      | vocabulario adquirido                        | fixtures sintéticos          | errores crudos del proveedor |
| onboarding completado | objetivos/intereses extensos                 | navegación documental        | clave de OpenAI              |
| última selección      | preferencias que requieran consulta/reportes | feature flags locales        |                              |

## Datos prohibidos

- claves o credenciales de OpenAI;
- tokens de autenticación o sesión;
- secretos efímeros reutilizables;
- audio crudo;
- transcripciones completas sensibles;
- credenciales del backend;
- conjuntos grandes o configuración de seguridad.

## Contrato del adaptador

```text
PreferencesStorage
  load(): Result<PreferencesV1, StorageRecovery>
  save(preferences): Result<void, StorageError>
  patch(changes): Result<PreferencesV1, StorageError>
  clear(): Result<void, StorageError>
  migrate(raw): Result<PreferencesCurrent, StorageRecovery>
```

La implementación concreta se define en Fase 1. La aplicación recibe la interfaz por dependencia y puede usar un adaptador en memoria en pruebas.

## Lectura segura

1. Capturar errores de disponibilidad/cuota.
2. Parsear JSON dentro de un límite de tamaño.
3. Verificar `schemaVersion`.
4. Validar estructura y valores enumerados.
5. Migrar versiones conocidas de forma inmutable.
6. Si no es recuperable, guardar una copia diagnóstica solo en memoria, volver a defaults y avisar de forma no bloqueante.
7. No registrar el valor completo.

## Versionado y migración

- Versión entera dentro del sobre.
- Migraciones puras `vN -> vN+1`, encadenadas y probadas.
- Una versión futura desconocida no se sobrescribe automáticamente; se ofrecen defaults para la sesión y opción de limpiar.
- Renombrar un ID de escenario exige un mapa de alias estable.
- El cambio de esquema se documenta en changelog.

## Borrado de datos

Configuración ofrece:

- **Restablecer preferencias:** borra solo el sobre LocalStorage.
- **Borrar todo mi progreso local:** coordina LocalStorage y SQLite; enumera qué se eliminará y requiere confirmación.
- **Conservar ajustes y borrar historial:** borra sesiones/revisiones en SQLite, no preferencias.

La UI confirma el resultado por almacén y permite reintentar si uno falla; no declara éxito parcial como éxito completo.

## Accesibilidad y privacidad

- La persona puede revisar y modificar todo lo almacenado como preferencia.
- El consentimiento de transcripción es explícito y revocable.
- Los mensajes distinguen “en este navegador” de “en este dispositivo”.
- Navegación privada o almacenamiento bloqueado degrada a una sesión temporal, no a un fallo total.

## Criterios de aceptación

- Valores ausentes, corruptos, antiguos y futuros tienen pruebas.
- Ningún acceso directo existe fuera del adaptador.
- El adaptador funciona bajo SSR/build sin asumir que `window` existe.
- `clear()` no toca claves de otros productos.
- No se almacenan secretos ni audio.

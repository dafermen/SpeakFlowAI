# Aplicaciones móviles con Capacitor

## Estado

SpeakFlowAI usa Capacitor 8.4.2. Los proyectos están en:

- Android: `apps/web/android`;
- iOS: `apps/web/ios`.

El identificador estable es `com.speakflowai.app` y ambos contenedores cargan el
build de `apps/web/dist`.

## Sincronizar cambios web

Desde la raíz:

```text
pnpm --filter @speakflow/web mobile:sync
pnpm --filter @speakflow/web check:native
```

El primer comando compila React y copia los assets a ambos proyectos. El segundo
comprueba app ID, directorio web y permisos esenciales.

## Backend accesible

`127.0.0.1` dentro de un teléfono apunta al propio teléfono. Para probar sesiones,
historial o voz en un dispositivo, construye la web con una API HTTPS alcanzable:

```text
VITE_API_BASE_URL=https://api.example.com pnpm --filter @speakflow/web mobile:sync
```

`VITE_API_BASE_URL` es público y nunca debe contener una clave. `OPENAI_API_KEY`
continúa únicamente en FastAPI.

## Android

Requisitos: Android Studio, JDK incluido, SDK 36 y licencias aceptadas. En Windows:

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
cd apps\web\android
.\gradlew.bat assembleDebug
```

El APK debug queda en `app/build/outputs/apk/debug/app-debug.apk`. La compilación
de 2026-07-31 produjo 4.242.447 bytes con SHA-256
`C208D14CD73A3C4BF5C0F693CA144571A0FD1C2E217C4F79398511EEE446480E`.

El manifiesto permite Internet y micrófono, desactiva backups del sistema y no
habilita tráfico HTTP en claro.

## iOS

La integración usa Swift Package Manager. En macOS con Xcode:

```text
pnpm --filter @speakflow/web mobile:sync
pnpm --filter @speakflow/web exec cap open ios
```

Selecciona una firma de desarrollo y ejecuta en simulador o dispositivo. El
`Info.plist` contiene una explicación en español para el permiso de micrófono.
Windows puede generar y sincronizar el proyecto, pero no compilarlo ni firmarlo.

## Ciclo de vida y privacidad

- Al ir a background, una sesión de voz activa se pausa.
- Al regresar, la persona decide cuándo reanudarla.
- El permiso se solicita solo al activar el micrófono.
- El audio no se persiste.
- Las transcripciones siguen la misma preferencia explícita que la web.

## Matriz antes de distribución

- Android físico: permiso aceptado/denegado, background, llamada entrante y red.
- iPhone físico: permiso aceptado/denegado, bloqueo, interrupción de audio y red.
- Ambos: teclado, safe areas, orientación, tema oscuro y zoom/tamaño de texto.
- Voz: Wi-Fi, red móvil, reconexión y fallback determinista.

Consulta el flujo oficial de [Capacitor](https://capacitorjs.com/docs/basics/workflow)
y las guías de [Android](https://capacitorjs.com/docs/android) e
[iOS](https://capacitorjs.com/docs/ios).

# SpeakFlowAI 1.0.0

Primer MVP completo de SpeakFlowAI, un compañero de voz para practicar inglés
con recorridos breves, feedback útil y privacidad por defecto.

## Incluye

- onboarding local y preferencias accesibles;
- cuatro escenarios de conversación;
- tutor determinista sin credenciales;
- voz OpenAI Realtime mediada por backend;
- pausa, silencio, repetición, ritmo, subtítulos y reconexión;
- revisión con correcciones, vocabulario y frases reutilizables;
- sesiones, historial, métricas, racha y progreso en SQLite;
- consentimiento explícito para retener transcripciones;
- web responsive, Android/iOS con Capacitor y documentación buscable.

## Seguridad y calidad

- ninguna clave en frontend;
- audio nunca persistido;
- límites de tamaño, duración, tokens e inicios;
- 20 pruebas backend y 24 pruebas TypeScript;
- auditoría Node sin vulnerabilidades conocidas;
- APK debug reproducible y workflow de GitHub Pages.

## Validaciones pendientes antes de distribución pública

- audio real con credencial local controlada;
- build/firma iOS en macOS;
- lector de pantalla y matriz de dispositivos físicos;
- backend HTTPS de producción para habilitar voz, guardado y progreso móvil.

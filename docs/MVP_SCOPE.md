# Alcance del MVP

## Incluido

1. Aplicación web responsive para móvil, tableta y escritorio.
2. Onboarding local corto.
3. Perfil de aprendizaje local y preferencias mediante un adaptador LocalStorage versionado.
4. Modos de aprendizaje y escenarios definidos en JSON validado.
5. Home pulido con una acción principal “Iniciar práctica”.
6. Preparación de sesión con opciones esenciales.
7. Tutor determinista falso antes de conectar voz real.
8. Conversación de voz en tiempo real mediada por backend.
9. Estados visibles: preparando, escuchando, procesando, hablando, pausa, reconexión y error.
10. Controles de sesión: iniciar, pausa cuando sea viable, silenciar, interrumpir, repetir, hablar más lento, subtítulos y finalizar.
11. Revisión de sesión con aciertos, correcciones, vocabulario, frases mejoradas y próxima actividad.
12. Historial y progreso local en SQLite.
13. Temas claro y oscuro.
14. Sitio HTML de documentación integrado.
15. Preparación para GitHub público y GitHub Pages.
16. Preparación para Capacitor sin proyectos nativos durante las primeras fases web.

## Excluido

- autenticación, registro, recuperación de contraseña, OAuth y roles;
- múltiples usuarios, cuentas organizacionales o sincronización en nube;
- PostgreSQL obligatorio para el MVP;
- pagos, funciones sociales y administración;
- almacenamiento de audio crudo;
- despliegue del backend en GitHub Pages;
- proyectos iOS o Android antes de que la web sea estable;
- ejecución de toda la estrategia costosa de pruebas en cada cambio pequeño.

## Supuestos

- El dispositivo ofrece micrófono y reproducción de audio compatibles.
- La voz real requiere red y un backend seguro.
- El usuario acepta el permiso de micrófono durante la sesión, no durante el onboarding.
- Las transcripciones completas se guardan solo cuando la opción correspondiente está activa y se explican sus consecuencias.
- Todos los ejemplos públicos serán sintéticos.

## Criterios globales de aceptación

- El flujo crítico funciona en orientación vertical móvil y escritorio.
- La interfaz indica de forma textual y visual el estado de voz.
- Ningún secreto llega a LocalStorage, JSON público, repositorio o bundle del frontend.
- SQLite vive fuera del código fuente y usa migraciones.
- La lógica de dominio no depende de detalles particulares de SQLite.
- Las preferencias corruptas se recuperan con valores seguros.
- El contenido JSON inválido falla con un mensaje controlado.
- La documentación se genera como HTML estático y es legible en móvil.
- Los criterios de salida de cada fase se cumplen antes de iniciar la siguiente.

## Política de cambio de alcance

Una ampliación requiere:

1. registrar la propuesta en `DECISIONS_PENDING.md`;
2. evaluar impacto en privacidad, UX, arquitectura, pruebas y roadmap;
3. aceptar o rechazar mediante ADR cuando afecte una decisión estructural;
4. actualizar alcance, tareas y trazabilidad antes de implementar.

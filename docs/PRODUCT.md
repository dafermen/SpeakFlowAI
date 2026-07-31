# Definición del producto

## Visión

SpeakFlowAI convierte la práctica oral de inglés en una rutina breve, segura y relevante. La persona conversa con un tutor de voz, recibe señales inequívocas sobre el estado del micrófono y termina con una revisión breve que sugiere el siguiente paso.

## Problema

Las personas adultas que estudian inglés suelen saber más de lo que se atreven a decir. La práctica disponible puede ser poco contextual, intimidante, difícil de coordinar o excesivamente enfocada en teoría. Las herramientas técnicas de voz, además, suelen dejar dudas sobre si escuchan, procesan o reproducen audio.

## Usuario primario

Una persona adulta hispanohablante, inicialmente un solo usuario local, con nivel de inglés básico alto a avanzado que desea:

- ganar fluidez y confianza;
- practicar situaciones cotidianas o profesionales;
- preparar conversaciones de soporte de TI o entrevistas de software;
- recibir explicaciones breves en español cuando sean necesarias;
- practicar desde teléfono, tableta o computadora.

## Propuesta de valor

“Practica conversaciones útiles en inglés con un compañero de voz que te da espacio para hablar, te muestra claramente qué está ocurriendo y convierte cada sesión en un siguiente paso alcanzable.”

## Principios

1. Hablar antes que configurar.
2. La siguiente acción siempre debe ser evidente.
3. El error es parte del aprendizaje y nunca se presenta como fracaso.
4. El estado del micrófono nunca puede ser ambiguo.
5. La retroalimentación debe ser concreta, breve y accionable.
6. La privacidad local y la minimización de datos son valores predeterminados.
7. El diseño sirve a una persona adulta y evita tanto el tono infantil como el panel administrativo.
8. Cada fase entrega una capacidad verificable antes de avanzar.

## Resultado de éxito del MVP

El MVP tiene éxito si una persona puede completar el recorrido onboarding → preparación → conversación → revisión, repetirlo con poco esfuerzo y reconocer progreso local sin necesitar una cuenta.

## Indicadores iniciales

- Tiempo mediano desde Home hasta iniciar práctica: objetivo menor de 45 segundos tras el onboarding.
- Finalización de onboarding: objetivo mayor de 85 % en pruebas de aceptación.
- Sesiones que llegan a revisión sin bloqueo recuperable: objetivo mayor de 90 % en entorno de prueba estable.
- Comprensión del estado del micrófono: 100 % de participantes en prueba debe poder identificarlo.
- Acciones principales operables por teclado y lector de pantalla: 100 % del flujo crítico.
- Valoración cualitativa de “me sentí cómodo hablando”: tendencia positiva, sin usarla como métrica punitiva.

## Restricciones del MVP

- Una persona local y sin autenticación.
- SQLite como persistencia.
- Sin almacenamiento de audio crudo.
- Integración de voz real solo en Fase 3.
- Aplicación web estable antes de generar proyectos nativos.
- Sin aprobación de producción hasta completar la Fase 6.

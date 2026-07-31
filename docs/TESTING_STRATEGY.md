# Estrategia de pruebas

## Principio

La arquitectura soporta una estrategia completa, pero la ejecución se ajusta al riesgo y a la etapa. Cada iteración recibe retroalimentación rápida; cada cierre de fase amplía la cobertura; la Fase 6 ejecuta la puerta completa antes de producción.

## Durante una iteración normal

Ejecutar solo lo relacionado con el cambio:

1. formato;
2. lint del código modificado;
3. verificación de tipos de módulos afectados;
4. pruebas unitarias enfocadas;
5. pruebas de componentes enfocadas;
6. pruebas backend enfocadas;
7. integración enfocada si cambia infraestructura;
8. smoke test pequeño del flujo crítico cuando corresponda.

No ejecutar de forma rutinaria toda la suite end-to-end, mutación, fuzzing, rendimiento, resiliencia, compatibilidad o seguridad después de cada cambio pequeño.

## Al cierre de cada fase

- suite unitaria completa;
- suite completa de componentes frontend;
- suite backend completa;
- integración relevante;
- contratos relevantes;
- smoke end-to-end de caminos críticos;
- builds completos de frontend y backend;
- build documental y validación de enlaces.

El informe de salida registra comando, entorno, resultado, fallos aceptados y responsable de seguimiento.

## Fase 6: puerta completa

Antes de aprobar producción:

- aceptación;
- unitarias;
- property-based e invariantes;
- mutación;
- fuzzing;
- integración;
- contratos;
- end-to-end;
- regresión;
- seguridad;
- concurrencia y resiliencia;
- rendimiento y recursos;
- compatibilidad y despliegue;
- auditoría de accesibilidad;
- build, enlaces, Mermaid, navegación y base path documental;
- validación de despliegue y rollback.

No se aprueba despliegue hasta documentar resultados y resolver los bloqueos.

## Pirámide y límites

| Nivel          | Enfoque                                                  | Dependencias                 |
| -------------- | -------------------------------------------------------- | ---------------------------- |
| Dominio/unidad | reglas de sesión, progreso, migraciones de preferencias  | ninguna o fakes              |
| Componente     | estados, controles, foco y responsive                    | DOM simulado                 |
| Backend        | endpoints, servicios, errores sanitizados                | repositorio temporal         |
| Integración    | SQLAlchemy/SQLite, migraciones, JSON, proveedor adaptado | infraestructura controlada   |
| Contrato       | frontend-API, esquemas de contenido, proveedor           | dobles/verificador           |
| E2E            | onboarding → sesión falsa → revisión                     | sistema desplegado de prueba |

La voz real usa dobles deterministas para la mayoría de pruebas; pocas pruebas controladas llegan al proveedor para evitar coste, flakiness y exposición de datos.

## Invariantes importantes

- un estado de sesión tiene una única etiqueta pública;
- micrófono silenciado nunca aparece como escuchando;
- una sesión finalizada no acepta nuevos turnos;
- timestamps persistidos están en UTC;
- toda observación pertenece a una sesión;
- preferencias inválidas producen defaults válidos;
- ningún contenido publicado referencia un ID inexistente;
- borrar datos nunca elimina claves ajenas a SpeakFlowAI.

## Accesibilidad

- análisis estático como ayuda, no sustituto;
- teclado completo y orden de foco;
- lector de pantalla en flujo crítico;
- contraste y zoom al 200 %;
- reducción de movimiento;
- estados no comunicados solo por color;
- objetivos táctiles de al menos 44 × 44 CSS px cuando sea práctico.

## Datos de prueba

Solo información sintética, determinista y pública. No se copian transcripciones personales, datos de empleadores ni respuestas reales del proveedor. Los fixtures con audio, si llegan a ser necesarios, serán propios o con licencia compatible y mínima duración.

## Criterios para detener una iteración

- regresión en el flujo cambiado;
- error de tipos o lint nuevo;
- migración irreversible sin estrategia;
- estado de micrófono ambiguo;
- filtración de secreto o dato sensible;
- test enfocado no determinista sin diagnóstico.

## Lo que no se permite

- eliminar o debilitar una prueba para acelerar;
- ocultar un fallo con reintentos indiscriminados;
- depender de una suite costosa como único control;
- afirmar cobertura de seguridad solo por lint;
- publicar sin la puerta de Fase 6.

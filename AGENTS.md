# Instrucciones de trabajo de SpeakFlowAI

## Orden obligatorio

1. Leer `CURRENT_STATUS.md`, `TASKS.md` y el documento de la fase activa.
2. Trabajar únicamente en la primera tarea `READY`.
3. Completar actividades y subtareas en el orden indicado.
4. Ejecutar validación enfocada durante iteración.
5. Actualizar documentación, estado y trazabilidad.
6. Ejecutar la validación de cierre antes de proponer la fase siguiente.
7. Detenerse para revisión humana.

No implementar trabajo marcado `LOCKED`. No combinar fases en una sola entrega.

## Restricciones permanentes

- MVP personal y sin autenticación.
- SQLite + SQLAlchemy/Alembic; PostgreSQL solo como migración futura.
- LocalStorage solo mediante adaptador y sin secretos.
- JSON solo para contenido estático/semiestático validado.
- Sin audio crudo persistido.
- Claves de OpenAI solo en backend.
- Datos públicos siempre sintéticos.
- Proyectos nativos solo en Fase 7.

## Validación

Iteración: formato, lint/tipos afectados, pruebas enfocadas y smoke mínimo si aplica. Cierre: suites completas relevantes, builds y docs. Producción: puerta completa de Fase 6.

## Escritura de decisiones

Una decisión estructural requiere ADR. No reescribir ADR aceptadas; crear una que las sustituya.

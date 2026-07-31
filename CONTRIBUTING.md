# Contribuir

## Antes de cambiar

1. Revisa [CURRENT_STATUS.md](CURRENT_STATUS.md) y [TASKS.md](TASKS.md).
2. Trabaja solo en la primera tarea desbloqueada de la fase activa.
3. Confirma que la fase anterior cumple su criterio de salida.
4. Registra decisiones estructurales mediante ADR.

## Cambios

- Mantén slices pequeños y revisables.
- No agregues funciones de fases posteriores.
- Actualiza documentación y pruebas directamente afectadas.
- Usa solo datos sintéticos y públicos.
- No debilites pruebas para acelerar.
- No agregues autenticación ni PostgreSQL como requisito del MVP sin una decisión aprobada.

## Validación

Durante iteración ejecuta formato, lint/tipos afectados y pruebas enfocadas. Al cierre de fase ejecuta las suites completas definidas en [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md). La puerta exhaustiva corresponde a Fase 6.

## Pull requests

Describe problema, alcance, fase/tarea, riesgos, pruebas, accesibilidad, privacidad y documentación. Un PR no debe mezclar tareas no dependientes ni saltar fases.

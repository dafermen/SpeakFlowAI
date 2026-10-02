# Evidencia de calidad de producción

Fecha de ejecución: 2026-07-31

Última actualización técnica: 2026-10-01 (M1-T17).

## Resultado

La puerta automatizable de Fase 6 está aprobada. Las validaciones se ejecutaron
en Windows, Node.js 24 y Python 3.12 sobre el proyecto canónico.

| Área                | Evidencia                            | Resultado                    |
| ------------------- | ------------------------------------ | ---------------------------- |
| Formato             | Prettier y Ruff                      | Aprobado                     |
| Estático            | ESLint, Ruff y mypy estricto         | Aprobado                     |
| Tipos               | TypeScript por workspace             | Aprobado                     |
| Backend             | 19 pruebas                           | Aprobado                     |
| TypeScript          | 24 pruebas                           | Aprobado                     |
| Fuzz determinista   | 200 entradas Unicode generadas       | Aprobado                     |
| Contrato            | OpenAPI y rutas MVP                  | Aprobado                     |
| Migraciones         | upgrade/downgrade y claves foráneas  | Aprobado                     |
| Resiliencia         | voz, API offline, fallback y límites | Aprobado                     |
| Dependencias Python | `pip check`                          | Sin incompatibilidades       |
| Dependencias Node   | `pnpm audit --audit-level high`      | 0 vulnerabilidades conocidas |
| Build               | React y VitePress                    | Aprobado                     |
| Bundle web          | JS 312,81 kB; CSS 25,19 kB           | Dentro de 400/60 kB          |
| Rendimiento API     | 500 solicitudes in-process           | p50 3,408 ms; p95 5,066 ms   |
| Secretos            | búsqueda de patrones sensibles       | Sin claves reales detectadas |

## Controles incorporados

- Identificador de solicitud propagable y logging sin cuerpo ni transcripción.
- Límite global de cuerpo HTTP y límites específicos por endpoint.
- Cabeceras `nosniff`, `no-referrer`, `same-site` y `no-store`.
- Configuración de duración y tokens acotada incluso ante variables inválidas.
- Auditoría de producción y presupuesto de bundle en CI.
- Resolución de Vite 6.4.3 para corregir la dependencia vulnerable de VitePress.

## Accesibilidad

La suite DOM verifica nombres accesibles y caminos de interacción por rol. La
interfaz conserva skip link, regiones semánticas, estados textuales, objetivos
táctiles, reducción de movimiento, alto contraste y reflow responsive definidos
en el sistema de diseño. La revisión con lector de pantalla y dispositivos reales
se registra como validación manual previa a una distribución pública.

## Notas aceptadas

- Mermaid se carga bajo demanda desde M1-T16. La portada tiene un presupuesto
  automático y ya no incluye el motor de diagramas en su descarga inicial.
- Starlette usa `httpx2` para `TestClient`; SpeakFlowAI lo declara solo para
  desarrollo. El adaptador de producción conserva `httpx` para OpenAI.
- La prueba con proveedor de voz real permanece fuera de la automatización para
  evitar coste y exposición, pero su audio bidireccional ya fue confirmado
  manualmente por la persona usuaria.

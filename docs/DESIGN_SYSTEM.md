# Sistema de diseño

## Concepto visual

**Calm Momentum:** una base azul tinta y superficies aireadas transmiten confianza; teal comunica actividad de voz; ámbar cálido comunica avance. Un orbe suave funciona como compañero, no como instrumento de medición.

## Personalidad

Moderna, limpia, conversacional, enfocada, alentadora y profesional. Premium por consistencia y detalle, no por exceso de efectos.

## Tokens de color

Valores iniciales que Fase 1 validará con pruebas de contraste:

| Token                 | Claro     | Oscuro    | Uso                    |
| --------------------- | --------- | --------- | ---------------------- |
| `surface.canvas`      | `#F6F8FB` | `#0B1320` | Fondo                  |
| `surface.raised`      | `#FFFFFF` | `#142033` | Tarjetas               |
| `text.primary`        | `#102A43` | `#F2F6FA` | Texto                  |
| `text.muted`          | `#52667A` | `#A9BACB` | Secundario             |
| `brand.primary`       | `#176B87` | `#55BED2` | Acción principal       |
| `brand.primaryStrong` | `#0F536B` | `#8AD9E7` | Hover/énfasis          |
| `accent.progress`     | `#E18A3B` | `#F1B36F` | Avance, no CTA crítica |
| `state.success`       | `#247A5A` | `#5ED0A2` | Éxito                  |
| `state.warning`       | `#A45A12` | `#F1B36F` | Reconexión             |
| `state.danger`        | `#B23A48` | `#FF8A98` | Error                  |
| `border.subtle`       | `#D7E0E8` | `#304158` | Separación             |

Los pares de texto/fondo deben alcanzar WCAG AA. No se presupone que un valor sirve sobre cualquier superficie.

## Gradiente y orbe

- Gradiente de marca: teal → azul violeta con saturación moderada.
- Escuchando: expansión 1–2 % y halo teal.
- Procesando: desplazamiento angular lento.
- Hablando: ondas discretas, no sincronización de labios.
- Reduced motion: cambio de borde, icono y etiqueta sin animación continua.
- Error: no sacudir; usar borde y mensaje.

## Tipografía

- Familia propuesta: **Inter Variable**, distribuida localmente o con mecanismo open-source que no bloquee privacidad.
- Fallback: `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.
- Escala: 12, 14, 16, 18, 22, 28, 36, 48 px.
- Texto base: 16 px, `line-height` 1.5.
- Documentación: 17 px en lectura larga.
- Máximo dos estilos tipográficos funcionales; no otra familia decorativa.
- Soporte completo de caracteres ingleses y españoles.

## Espaciado, forma y profundidad

- Unidad base: 4 px.
- Escala: 4, 8, 12, 16, 24, 32, 48, 64.
- Radios: 8 (controles), 12 (tarjetas), 16 (paneles), 999 (chips/orbe).
- Sombras: `sm` para separación, `md` para overlays; no sombras intensas en todas las tarjetas.
- Bordes visibles en modo de alto contraste.

## Movimiento

| Token            | Duración | Uso                           |
| ---------------- | -------: | ----------------------------- |
| `motion.instant` |    80 ms | feedback presionado           |
| `motion.fast`    |   150 ms | hover/foco                    |
| `motion.normal`  |   240 ms | paneles                       |
| `motion.slow`    |   480 ms | transición de estado del orbe |

Curva principal: `cubic-bezier(0.2, 0.8, 0.2, 1)`. No se anima más de una transformación dominante durante la sesión. `prefers-reduced-motion` reduce duración a casi cero y elimina ciclos.

## Breakpoints y capas

- `bp.compact`: 0
- `bp.medium`: 600 px
- `bp.expanded`: 900 px
- `bp.wide`: 1280 px
- `z.base`: 0
- `z.sticky`: 10
- `z.overlay`: 30
- `z.dialog`: 40
- `z.toast`: 50

No se introducen valores z-index locales fuera de la escala.

## Estados de componentes

Cada componente interactivo define: default, hover, active, focus-visible, disabled, loading y error cuando corresponda. Componentes de voz añaden listening, processing, speaking, paused, reconnecting y muted.

## Iconos e ilustraciones

- Un sistema de iconos open-source con trazo consistente, a seleccionar en Fase 1.
- Todo icono crítico se acompaña de etiqueta visible o nombre accesible.
- Mismo significado, mismo icono.
- Ilustraciones solo en onboarding, vacío, hitos, final de sesión y permisos.
- Activos originales o con licencia documentada; nunca clones comerciales.

## Voz de contenido

- Directa: “Te escucho”, no “Entrada de audio activada”.
- Alentadora: “Prueba esta opción”, no “Incorrecto”.
- Específica: “La conexión se interrumpió”, no “Algo salió mal”.
- Responsable: “Actividad de voz”, no “Análisis exacto”.
- Bilingüe con intención: inglés para practicar; español solo como apoyo configurado.

## Inventario base de Fase 1

- Button, IconButton y Link.
- TextField, Select, RadioGroup, Checkbox, Switch y Slider discreto.
- Card, Badge, Progress, Alert y EmptyState.
- BottomNavigation, NavigationRail/Sidebar.
- Sheet, Dialog, Popover y Tooltip.
- ActivityOrb, VoiceStatus, SessionControlDock y CaptionPanel.
- Tokens, tema claro/oscuro y utilidades de safe area.

## Criterios de aceptación

- Ningún valor visual de marca se hard-codea fuera de tokens.
- Todos los componentes se revisan en claro, oscuro, alto contraste y reduced motion.
- El foco cumple contraste y no queda oculto.
- Texto y controles críticos cumplen AA.
- La identidad se reconoce en Home, sesión y documentación sin convertirlas en experiencias desconectadas.

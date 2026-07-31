# Diseño responsive

## Estrategia

Mobile-first con una sola arquitectura de información que se adapta progresivamente. La experiencia prioritaria es la sesión activa en un teléfono vertical; escritorio añade contexto sin cambiar el flujo.

## Rangos de referencia

Los breakpoints son tokens y podrán ajustarse por comportamiento observado:

| Token      |   Desde | Uso esperado                          |
| ---------- | ------: | ------------------------------------- |
| `compact`  |    0 px | Teléfonos y WebView                   |
| `medium`   |  600 px | Teléfono horizontal/tableta pequeña   |
| `expanded` |  900 px | Tableta grande/laptop                 |
| `wide`     | 1280 px | Escritorio, ancho de lectura limitado |

No se infiere dispositivo por el ancho; se usan capacidades, orientación y espacio disponible.

## Tabla de comportamiento

| Área          | Compact                      | Medium                    | Expanded/Wide                      |
| ------------- | ---------------------------- | ------------------------- | ---------------------------------- |
| Navegación    | Barra inferior               | Barra inferior o rail     | Panel lateral                      |
| Home          | Una columna                  | Grid de 2                 | Hero + grid, máx. 3 columnas       |
| Preparación   | Formulario apilado           | Dos columnas cuando quepa | Opciones + resumen lateral         |
| Sesión        | Orbe central y dock inferior | Orbe + subtítulos amplios | Sesión central + panel contextual  |
| Controles     | Fijos sobre safe area        | Fijos/repartidos          | Barra bajo el orbe                 |
| Subtítulos    | Panel plegable               | Región inferior           | Panel lateral                      |
| Ajustes       | Sheet de pantalla completa   | Sheet ancho               | Dialog/panel                       |
| Revisión      | Tarjetas apiladas            | Dos columnas selectivas   | Contenido + siguiente paso lateral |
| Documentación | Menú drawer                  | Navegación plegable       | Sidebar + TOC                      |

## Wireframes

### Sesión compacta

```text
┌──────────────────────────┐
│ ← Objetivo       04:12  ●│
│                          │
│        Te escucho        │
│                          │
│          ◯◯◯             │
│       orbe activo        │
│                          │
│  “Cuéntame qué hiciste”  │
│  [Subtítulos: ocultar]   │
│                          │
│ ┌──────────────────────┐ │
│ │ Mute  Repetir  Lento │ │
│ │       Finalizar      │ │
│ └──── safe area ───────┘ │
└──────────────────────────┘
```

### Sesión expandida

```text
┌────────────────────────────────────────────────────┐
│ Objetivo: daily stand-up       Conectado     04:12 │
├───────────────────────────────┬────────────────────┤
│                               │ Subtítulos         │
│          Te escucho           │ Tutor: ...         │
│                               │ Tú: ...            │
│             ◯◯◯               │                    │
│                               │ Contexto opcional  │
│ [Mute] [Repetir] [Más lento]  │                    │
│        [Finalizar]             │                    │
└───────────────────────────────┴────────────────────┘
```

## Safe areas y viewport móvil

- Padding inferior: `max(token, env(safe-area-inset-bottom))`.
- Respetar `safe-area-inset-top/left/right`.
- Usar unidades de viewport dinámicas (`dvh`) con fallback.
- El dock crítico nunca queda bajo barras del sistema.
- Al abrir teclado, el foco y la acción actual permanecen visibles.
- Cambios de orientación no reinician sesión ni audio.
- La reanudación desde background verifica permisos, conexión y estado real antes de mostrar “Te escucho”.

## Alcance táctil y una mano

- Controles principales en la mitad inferior en compacto.
- Objetivos táctiles mínimos de 44 × 44 CSS px.
- Separación suficiente entre silenciar y finalizar.
- Finalizar no comparte gesto con navegación del sistema.
- Acciones destructivas no dependen de press-and-hold.

## Contenido y reflow

- Ancho de lectura documental entre 65 y 75 caracteres.
- No hay scroll horizontal a 320 CSS px salvo ejemplos de código con contenedor explícito.
- Texto de interfaz soporta expansión de 30 % para español.
- Tablas se convierten en tarjetas o usan scroll etiquetado; no reducen texto por debajo del mínimo.
- El panel de subtítulos limita altura y conserva los controles.

## Capacitor readiness

Antes de proyectos nativos:

- no depender de APIs web sin adaptador;
- encapsular permisos, ciclo de vida, audio y almacenamiento;
- definir manejo de background/foreground e interrupciones;
- evitar rutas/activos incompatibles con WebView;
- probar viewport, teclado y safe areas en navegadores móviles.

Los proyectos iOS/Android se crean únicamente en Fase 7.

## Matriz mínima de revisión

| Caso                | Viewport/capacidad                  |
| ------------------- | ----------------------------------- |
| Teléfono pequeño    | 320 × 568, táctil                   |
| Teléfono moderno    | 390 × 844, safe areas               |
| Teléfono horizontal | 844 × 390                           |
| Tableta             | 768 × 1024                          |
| Laptop              | 1366 × 768                          |
| Escritorio          | 1440 × 900                          |
| Zoom                | 200 %                               |
| Preferencias        | reduced-motion, dark, high contrast |

## Criterios de aceptación

- El control de micrófono y Finalizar siempre están visibles o a una acción inequívoca.
- Ningún control crítico queda a menos del safe area.
- La sesión no necesita scroll para acceder a controles en 320 × 568 cuando los subtítulos están plegados.
- La navegación cambia de presentación, no de significado.
- Teclado, orientación e interrupción conservan el estado coherente.

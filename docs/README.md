# Documentación de SpeakFlowAI

## Producto

- [Definición del producto](PRODUCT.md)
- [Alcance del MVP](MVP_SCOPE.md)
- [Recorridos del usuario](USER_JOURNEYS.md)
- [Arquitectura general](ARCHITECTURE.md)
- [Voz en tiempo real](REALTIME_VOICE.md)
- [Arquitectura de información](INFORMATION_ARCHITECTURE.md)

## Experiencia y diseño

- [Diseño de experiencia](UX_DESIGN.md)
- [Diseño responsive](RESPONSIVE_DESIGN.md)
- [Sistema de diseño](DESIGN_SYSTEM.md)

## Datos y contenido

- [Estrategia de base de datos](DATABASE_STRATEGY.md)
- [Estrategia de LocalStorage](LOCAL_STORAGE.md)
- [Estrategia de contenido JSON](CONTENT_STRATEGY.md)

## Entrega y calidad

- [Caso de estudio](CASE_STUDY.md)
- [Guion de demo](DEMO_SCRIPT.md)
- [Sitio de documentación](DOCUMENTATION_SITE.md)
- [Publicación segura en GitHub](GITHUB_PUBLICATION.md)
- [Estrategia de pruebas](TESTING_STRATEGY.md)
- [Matriz de trazabilidad de Fase 0](TRACEABILITY_MATRIX.md)

## Desarrollo y aprendizaje

- [Preparar el entorno](development/GETTING_STARTED.md)
- [Estándar de documentación del código](development/CODE_DOCUMENTATION_STANDARD.md)
- [Recorrido guiado por el código](development/CODE_WALKTHROUGH.md)

## Gestión

- [Roadmap de fases](phases/ROADMAP.md)
- [Cierre de Fase 0](phases/PHASE_0.md)
- [Cierre de Fase 1](phases/PHASE_1.md)
- [Informe de finalización de Fase 0](/PHASE_0_COMPLETION_REPORT)
- [Informe de finalización de Fase 1](/PHASE_1_COMPLETION_REPORT)
- [Informe de finalización de Fase 2](/PHASE_2_COMPLETION_REPORT)
- [Informe de finalización de Fase 8](/PHASE_8_COMPLETION_REPORT)
- [Notas de versión 1.0.0](/RELEASE_NOTES_1.0.0)
- [Checklist de release](/RELEASE_CHECKLIST)
- [Registro de decisiones arquitectónicas](adr/README.md)

Los documentos fuente viven en `docs/` y VitePress los convierte en HTML navegable. La documentación de uso y desarrollo comparte búsqueda y diseño.

## DOC-STD-20261002 — Fuentes canónicas y rutas de lectura

Estándar documental v1.0. Idioma principal: español; se conservan los documentos técnicos existentes en inglés. Perfil: aplicación personal React/FastAPI con SQLite, voz mediante proveedor y proyectos móviles Capacitor.

| Necesidad | Fuente oficial |
| --- | --- |
| Probar el producto | [Guía de uso](USER_GUIDE.md) y [guion de demo](DEMO_SCRIPT.md) |
| Instalar y configurar | [Entorno local](development/GETTING_STARTED.md) |
| Entender componentes y datos | [Arquitectura](ARCHITECTURE.md), [base de datos](DATABASE_STRATEGY.md) y [voz](REALTIME_VOICE.md) |
| Conocer el estado real | [Estado actual](/CURRENT_STATUS) y [tareas](/TASKS) |
| Verificar calidad | [Estrategia](TESTING_STRATEGY.md) y [evidencia](QUALITY_REPORT.md) |
| Publicar | [Publicación](GITHUB_PUBLICATION.md) y [checklist](/RELEASE_CHECKLIST) |
| Administrar acceso demo | [DEMO_MODE](DEMO_MODE.md) |
| Resolver fallos | [Solución de problemas](TROUBLESHOOTING.md) |
| Revisar límites móviles | [Capacitor](MOBILE.md) |

Para evaluar el portafolio: comenzar por el caso de estudio y la guía de uso. Para desarrollar: preparar el entorno, revisar arquitectura y pruebas. Para operar el servidor protegido: revisar DEMO_MODE y el registro de despliegue del estado actual.

La clave de la entrada demo pertenece a la configuración privada del gateway del servidor. El archivo local de desarrollo alimenta el backend y no activa automáticamente esa barrera. La clave de OpenAI permanece únicamente en backend. Desactivar la barrera no convierte el modelo personal en multiusuario ni separa datos entre visitantes.

CURRENT_STATUS contiene el estado vigente; los informes de fases y QUALITY_REPORT conservan evidencia fechada. No actualizar una cifra histórica como si fuese una prueba nueva. Las validaciones móviles y auditivas se reportan por plataforma y entorno, sin deducirlas del build web.

Al cambiar comandos, variables, voz, almacenamiento o publicación, actualizar la guía correspondiente y compilar VitePress. Mantener sus rutas públicas bajo /docs/ y comprobar enlaces después de los rewrites. Registrar el commit publicado y el artefacto desplegado por separado.

import type { DefaultTheme } from "vitepress";

export const sidebar: DefaultTheme.Sidebar = {
  "/docs/": [
    {
      text: "Producto",
      items: [
        { text: "Introducción", link: "/docs/" },
        { text: "Definición", link: "/docs/PRODUCT" },
        { text: "Alcance MVP", link: "/docs/MVP_SCOPE" },
        { text: "Recorridos", link: "/docs/USER_JOURNEYS" },
        { text: "Información", link: "/docs/INFORMATION_ARCHITECTURE" },
        { text: "Guía de uso", link: "/docs/USER_GUIDE" },
        { text: "Solución de problemas", link: "/docs/TROUBLESHOOTING" },
      ],
    },
    {
      text: "Experiencia y diseño",
      items: [
        { text: "UX", link: "/docs/UX_DESIGN" },
        { text: "Responsive", link: "/docs/RESPONSIVE_DESIGN" },
        { text: "Sistema de diseño", link: "/docs/DESIGN_SYSTEM" },
      ],
    },
    {
      text: "Arquitectura",
      items: [
        { text: "Visión general", link: "/docs/ARCHITECTURE" },
        { text: "Voz Realtime", link: "/docs/REALTIME_VOICE" },
        { text: "Feedback y retención", link: "/docs/FEEDBACK_AND_RETENTION" },
        { text: "Preparar entorno", link: "/docs/development/GETTING_STARTED" },
        { text: "Base de datos", link: "/docs/DATABASE_STRATEGY" },
        { text: "LocalStorage", link: "/docs/LOCAL_STORAGE" },
        { text: "Contenido JSON", link: "/docs/CONTENT_STRATEGY" },
        { text: "Pruebas", link: "/docs/TESTING_STRATEGY" },
        { text: "Evidencia de calidad", link: "/docs/QUALITY_REPORT" },
        { text: "Aplicaciones móviles", link: "/docs/MOBILE" },
      ],
    },
    {
      text: "Entrega",
      items: [
        { text: "Caso de estudio", link: "/docs/CASE_STUDY" },
        { text: "Guion de demo", link: "/docs/DEMO_SCRIPT" },
        { text: "Sitio documental", link: "/docs/DOCUMENTATION_SITE" },
        { text: "GitHub público", link: "/docs/GITHUB_PUBLICATION" },
        { text: "Roadmap", link: "/docs/phases/ROADMAP" },
        { text: "Decisiones", link: "/docs/adr/" },
      ],
    },
  ],
  "/CURRENT_STATUS": [
    {
      text: "Gestión del proyecto",
      items: [
        { text: "Estado", link: "/CURRENT_STATUS" },
        { text: "Tareas", link: "/TASKS" },
        { text: "Decisiones pendientes", link: "/DECISIONS_PENDING" },
        { text: "Changelog", link: "/CHANGELOG" },
        { text: "Notas 1.0.0", link: "/RELEASE_NOTES_1.0.0" },
        { text: "Checklist de release", link: "/RELEASE_CHECKLIST" },
        { text: "Cierre de Fase 8", link: "/PHASE_8_COMPLETION_REPORT" },
        { text: "Contribuir", link: "/CONTRIBUTING" },
        { text: "Seguridad", link: "/SECURITY" },
      ],
    },
  ],
};

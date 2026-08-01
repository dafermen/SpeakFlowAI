import type { DefaultTheme } from "vitepress";

export const sidebar: DefaultTheme.Sidebar = {
  "/": [
    {
      text: "Producto",
      items: [
        { text: "Introducción", link: "/" },
        { text: "Definición", link: "/PRODUCT" },
        { text: "Alcance MVP", link: "/MVP_SCOPE" },
        { text: "Recorridos", link: "/USER_JOURNEYS" },
        { text: "Información", link: "/INFORMATION_ARCHITECTURE" },
        { text: "Guía de uso", link: "/USER_GUIDE" },
        { text: "Solución de problemas", link: "/TROUBLESHOOTING" },
      ],
    },
    {
      text: "Experiencia y diseño",
      items: [
        { text: "UX", link: "/UX_DESIGN" },
        { text: "Responsive", link: "/RESPONSIVE_DESIGN" },
        { text: "Sistema de diseño", link: "/DESIGN_SYSTEM" },
      ],
    },
    {
      text: "Arquitectura",
      items: [
        { text: "Visión general", link: "/ARCHITECTURE" },
        { text: "Voz Realtime", link: "/REALTIME_VOICE" },
        { text: "Feedback y retención", link: "/FEEDBACK_AND_RETENTION" },
        { text: "Preparar entorno", link: "/development/GETTING_STARTED" },
        {
          text: "Estándar de documentación",
          link: "/development/CODE_DOCUMENTATION_STANDARD",
        },
        {
          text: "Recorrido por el código",
          link: "/development/CODE_WALKTHROUGH",
        },
        { text: "Base de datos", link: "/DATABASE_STRATEGY" },
        { text: "LocalStorage", link: "/LOCAL_STORAGE" },
        { text: "Contenido JSON", link: "/CONTENT_STRATEGY" },
        { text: "Pruebas", link: "/TESTING_STRATEGY" },
        { text: "Evidencia de calidad", link: "/QUALITY_REPORT" },
        { text: "Aplicaciones móviles", link: "/MOBILE" },
      ],
    },
    {
      text: "Entrega",
      items: [
        { text: "Caso de estudio", link: "/CASE_STUDY" },
        { text: "Guion de demo", link: "/DEMO_SCRIPT" },
        { text: "Sitio documental", link: "/DOCUMENTATION_SITE" },
        { text: "GitHub público", link: "/GITHUB_PUBLICATION" },
        { text: "Roadmap", link: "/phases/ROADMAP" },
        { text: "Decisiones", link: "/adr/" },
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

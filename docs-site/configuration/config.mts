import { defineConfig } from "vitepress";

import { sidebar } from "./navigation";

const base = process.env.SPEAKFLOW_DOCS_BASE ?? "/docs/";

export default defineConfig({
  lang: "es",
  title: "SpeakFlowAI",
  description:
    "Documentación de producto, experiencia y arquitectura de SpeakFlowAI.",
  base,
  cleanUrls: true,
  lastUpdated: true,
  outDir: "./dist/docs",
  // Los documentos viven en /docs dentro del repositorio, pero el sitio ya
  // usa /docs/ como base pública. Aplanar esta carpeta evita /docs/docs/.
  rewrites: {
    "docs/:path*": ":path*",
  },
  srcExclude: [
    ".venv/**",
    "apps/**",
    "docs-site/**",
    "node_modules/**",
    "packages/**",
    "work/**",
  ],
  head: [
    ["meta", { name: "theme-color", content: "#176b87" }],
    ["meta", { name: "color-scheme", content: "light dark" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "SpeakFlowAI" }],
    [
      "meta",
      {
        property: "og:description",
        content: "Practice English. Build confidence.",
      },
    ],
    ["meta", { property: "og:image", content: `${base}social-card.png` }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ],
  themeConfig: {
    nav: [
      { text: "Documentación", link: "/" },
      { text: "Producto", link: "/PRODUCT" },
      { text: "Arquitectura", link: "/ARCHITECTURE" },
      { text: "Estado", link: "/CURRENT_STATUS" },
    ],
    sidebar,
    search: {
      provider: "local",
    },
    outline: {
      level: [2, 3],
      label: "En esta página",
    },
    docFooter: {
      prev: "Anterior",
      next: "Siguiente",
    },
    darkModeSwitchLabel: "Apariencia",
    lightModeSwitchTitle: "Usar tema claro",
    darkModeSwitchTitle: "Usar tema oscuro",
    returnToTopLabel: "Volver arriba",
    sidebarMenuLabel: "Menú",
    lastUpdated: {
      text: "Última actualización",
      formatOptions: {
        dateStyle: "medium",
        timeStyle: "short",
      },
    },
    socialLinks: [],
  },
  markdown: {
    lineNumbers: true,
    config(markdown) {
      const renderFence = markdown.renderer.rules.fence?.bind(
        markdown.renderer.rules,
      );

      markdown.renderer.rules.fence = (tokens, index, options, env, self) => {
        const token = tokens[index];

        if (!token) {
          return "";
        }

        if (token.info.trim() !== "mermaid") {
          return renderFence
            ? renderFence(tokens, index, options, env, self)
            : self.renderToken(tokens, index, options);
        }

        const graph = encodeURIComponent(token.content);
        const previousHeading = tokens
          .slice(0, index)
          .toReversed()
          .find(
            (candidate, candidateIndex, reversedTokens) =>
              candidate.type === "inline" &&
              reversedTokens[candidateIndex + 1]?.type === "heading_open",
          );
        const label = encodeURIComponent(
          `Diagrama: ${previousHeading?.content || "contenido relacionado"}`,
        );

        return `<ClientOnly><MermaidDiagram graph="${graph}" label="${label}" /></ClientOnly>`;
      };
    },
  },
  vite: {
    build: {
      // Mermaid se divide en módulos opcionales que pueden superar 500 kB.
      // `check:bundle` controla por separado los recursos que sí carga la portada.
      chunkSizeWarningLimit: 700,
    },
  },
});

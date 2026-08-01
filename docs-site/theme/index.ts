import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";

import "./custom.css";

/** Crea el enlace que sale de la documentación y vuelve a la aplicación. */
function createAppHomeLink(location: "desktop" | "mobile") {
  return h(
    "a",
    {
      "aria-label": "Volver al inicio de SpeakFlowAI",
      class: ["app-home-link", `app-home-link--${location}`],
      href: "/",
    },
    [
      h("span", { "aria-hidden": "true" }, "←"),
      h("span", "Volver a la aplicación"),
    ],
  );
}

/** Extiende VitePress con una salida visible hacia la aplicación web. */
export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      "nav-bar-content-after": () => createAppHomeLink("desktop"),
      "nav-screen-content-after": () => createAppHomeLink("mobile"),
    }),
} satisfies Theme;

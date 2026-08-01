/** Punto de entrada del navegador: estilos globales, raíz React y modo estricto. */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@speakflow/design-system/tokens.css";
import "@speakflow/design-system/components.css";
import { App } from "./App";
import "./styles.css";

/** Elemento único definido por `index.html` donde React toma control de la página. */
const root = document.getElementById("root");

if (!root) {
  throw new Error("No se encontró el contenedor raíz de SpeakFlowAI.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

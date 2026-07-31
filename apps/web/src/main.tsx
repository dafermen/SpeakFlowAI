import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@speakflow/design-system/tokens.css";
import "@speakflow/design-system/components.css";
import { App } from "./App";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("No se encontró el contenedor raíz de SpeakFlowAI.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

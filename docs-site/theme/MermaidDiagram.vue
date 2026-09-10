<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

/**
 * Diagrama Mermaid que carga el motor únicamente cuando la página lo necesita.
 *
 * Entrada: `graph` contiene el texto Mermaid codificado para viajar con
 * seguridad dentro del HTML generado por Markdown.
 * Salida: un SVG accesible o un mensaje legible si el gráfico no puede dibujarse.
 */
const props = defineProps<{ graph: string; label: string }>();

const diagram = ref("");
const errorMessage = ref("");
const container = ref<HTMLElement>();
const accessibleLabel = computed(() => decodeURIComponent(props.label));
let themeObserver: MutationObserver | undefined;
let renderVersion = 0;

/** Colores de marca compartidos por todos los diagramas del sitio. */
const brandTheme = {
  primaryColor: "#e6f5f8",
  primaryTextColor: "#102a43",
  primaryBorderColor: "#176b87",
  lineColor: "#52667a",
  secondaryColor: "#f8eadb",
  tertiaryColor: "#f6f8fb",
};

/** Descarga Mermaid, dibuja el gráfico y descarta resultados ya obsoletos. */
async function renderDiagram() {
  const currentVersion = ++renderVersion;
  errorMessage.value = "";

  try {
    const { default: mermaid } = await import("mermaid");
    const darkMode = document.documentElement.classList.contains("dark");

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: darkMode ? "dark" : "base",
      themeVariables: darkMode ? undefined : brandTheme,
    });

    const graph = decodeURIComponent(props.graph);
    const id = `speakflow-diagram-${crypto.randomUUID()}`;
    const { svg } = await mermaid.render(id, graph);

    if (currentVersion === renderVersion) {
      diagram.value = svg;
      await nextTick();
      container.value
        ?.querySelector("svg")
        ?.setAttribute("aria-hidden", "true");
    }
  } catch {
    if (currentVersion === renderVersion) {
      diagram.value = "";
      errorMessage.value =
        "No se pudo mostrar este diagrama. El contenido escrito de la página sigue disponible.";
    }
  }
}

onMounted(() => {
  void renderDiagram();

  themeObserver = new MutationObserver(() => {
    void renderDiagram();
  });
  themeObserver.observe(document.documentElement, {
    attributeFilter: ["class"],
    attributes: true,
  });
});

onBeforeUnmount(() => {
  renderVersion += 1;
  themeObserver?.disconnect();
});
</script>

<template>
  <figure
    ref="container"
    :aria-label="accessibleLabel"
    class="mermaid-diagram"
    role="img"
  >
    <div v-if="diagram" v-html="diagram" />
    <p v-else-if="errorMessage" class="mermaid-diagram__message" role="alert">
      {{ errorMessage }}
    </p>
    <p v-else class="mermaid-diagram__message" role="status">
      Cargando diagrama…
    </p>
  </figure>
</template>

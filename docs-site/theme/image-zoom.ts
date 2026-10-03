import { nextTick, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vitepress";

/** Progressive enhancement: native dialog keeps Escape and focus restoration. */
export function useDocumentationImages(language: "en" | "es") {
  const route = useRoute();
  let dispose: (() => void) | undefined;
  onMounted(() => {
    const label = language === "es" ? "Ampliar imagen" : "Enlarge image";
    const dialog = document.createElement("dialog");
    dialog.className = "docs-image-dialog";
    dialog.setAttribute("aria-label", label);
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = language === "es" ? "Cerrar imagen" : "Close image";
    close.autofocus = true;
    const preview = document.createElement("img");
    dialog.append(close, preview);
    document.body.append(dialog);
    let origin: HTMLImageElement | undefined;
    const closeDialog = () => dialog.close();
    const restoreFocus = () => origin?.isConnected && origin.focus();
    close.addEventListener("click", closeDialog);
    dialog.addEventListener("close", restoreFocus);
    const open = (event: Event) => {
      const target = event.target;
      if (
        !(target instanceof HTMLImageElement) ||
        !target.matches(".vp-doc img[data-docs-zoom]")
      )
        return;
      if (event instanceof KeyboardEvent && !["Enter", " "].includes(event.key))
        return;
      event.preventDefault();
      origin = target;
      preview.src = target.currentSrc || target.src;
      preview.alt = target.alt;
      dialog.showModal();
    };
    document.addEventListener("click", open);
    document.addEventListener("keydown", open);
    let active = true;
    const stop = watch(
      () => route.path,
      async () => {
        if (dialog.open) dialog.close();
        await nextTick();
        if (!active) return;
        document
          .querySelectorAll<HTMLImageElement>(".vp-doc img")
          .forEach((image) => {
            if (image.closest("a, button") || image.hasAttribute("tabindex"))
              return;
            image.dataset.docsZoom = "true";
            image.tabIndex = 0;
            image.setAttribute("role", "button");
            image.setAttribute("aria-label", `${label}: ${image.alt || label}`);
          });
      },
      { immediate: true, flush: "post" },
    );
    dispose = () => {
      active = false;
      stop();
      document.removeEventListener("click", open);
      document.removeEventListener("keydown", open);
      dialog.remove();
    };
  });
  onUnmounted(() => dispose?.());
}

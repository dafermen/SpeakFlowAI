import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Protege el peso de la primera visita a la documentación.
 *
 * Mermaid se carga después y solo en páginas con diagramas, por lo que medir
 * todos los módulos generados confundiría código opcional con descarga inicial.
 */
const outputDirectory = fileURLToPath(
  new URL("../../dist/docs/", import.meta.url),
);
const indexPath = join(outputDirectory, "index.html");
const html = await readFile(indexPath, "utf8");
const assetPattern = /(?:src|href)="([^"]+\.(?:js|css))"/g;
const initialAssets = [...html.matchAll(assetPattern)].map((match) => match[1]);

const budgets = {
  js: 300_000,
  css: 150_000,
};
const totals = { js: 0, css: 0 };
const failures = [];

for (const publicPath of initialAssets) {
  const assetsMarker = "/assets/";
  const assetsIndex = publicPath.lastIndexOf(assetsMarker);
  const relativePath =
    assetsIndex >= 0
      ? publicPath.slice(assetsIndex + 1)
      : publicPath.split("/").at(-1);

  if (!relativePath) {
    failures.push(`No se pudo resolver el recurso inicial: ${publicPath}`);
    continue;
  }

  const extension = relativePath.endsWith(".css") ? "css" : "js";
  const filePath = join(outputDirectory, relativePath);
  totals[extension] += (await stat(filePath)).size;
}

failures.push(
  ...Object.entries(budgets)
    .filter(([extension, budget]) => totals[extension] > budget)
    .map(
      ([extension, budget]) =>
        `${extension.toUpperCase()}: ${totals[extension]} bytes exceeds ${budget}`,
    ),
);

if (initialAssets.some((asset) => /mermaid|cynefin|cytoscape/i.test(asset))) {
  failures.push("La portada vuelve a precargar módulos de Mermaid.");
}

if (failures.length > 0) {
  throw new Error(`Docs bundle budget exceeded:\n${failures.join("\n")}`);
}

console.log(
  `SpeakFlowAI docs initial bundle: ${totals.js} bytes JS, ${totals.css} bytes CSS.`,
);

import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const budgets = { ".js": 400_000, ".css": 60_000 };
const assetsDirectory = fileURLToPath(
  new URL("../dist/assets/", import.meta.url),
);
const files = await readdir(assetsDirectory);
const failures = [];

for (const file of files) {
  const extension = Object.keys(budgets).find((candidate) =>
    file.endsWith(candidate),
  );
  if (!extension) continue;
  const { size } = await stat(join(assetsDirectory, file));
  const budget = budgets[extension];
  if (size > budget) failures.push(`${file}: ${size} bytes exceeds ${budget}`);
}

if (failures.length > 0) {
  throw new Error(`Bundle budget exceeded:\n${failures.join("\n")}`);
}

console.log("SpeakFlowAI web bundle is within its JavaScript and CSS budgets.");

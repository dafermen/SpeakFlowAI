import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const serverDir = path.join(projectDir, "dist", "server");

await mkdir(serverDir, { recursive: true });
await copyFile(
  path.join(projectDir, "sites", "worker.mjs"),
  path.join(serverDir, "index.js"),
);

process.stdout.write("Sites worker staged in dist/server/index.js\n");

/**
 * Inicia toda la experiencia local de SpeakFlowAI desde una sola terminal.
 *
 * Servicios administrados:
 * - React/Vite en http://127.0.0.1:4173
 * - FastAPI en http://127.0.0.1:8000
 * - VitePress en http://127.0.0.1:5174/docs/
 *
 * El proceso padre mantiene vivos los tres servicios y los cierra juntos al
 * recibir Ctrl + C. La clave de OpenAI se lee desde `.env`, pero nunca se imprime.
 */

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const isWindows = process.platform === "win32";
const pythonExecutable = path.join(
  projectDirectory,
  ".venv",
  isWindows ? "Scripts/python.exe" : "bin/python",
);
// Al ejecutar `pnpm start`, esta variable apunta al módulo JavaScript de pnpm.
// Reutilizarlo evita shells intermedios y advertencias de escape en Windows.
const pnpmScript = process.env.npm_execpath;
const checkOnly = process.argv.includes("--check");

/** Convierte `.env` en variables de proceso sin exponer sus valores. */
function readLocalEnvironment() {
  const environmentPath = path.join(projectDirectory, ".env");
  if (!existsSync(environmentPath)) return {};

  const variables = {};
  for (const rawLine of readFileSync(environmentPath, "utf8").split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator < 1) continue;

    const name = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/u.test(name)) continue;
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    variables[name] = value;
  }
  return variables;
}

/** Comprueba que un puerto local esté libre antes de iniciar los servicios. */
function assertPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => {
      reject(
        new Error(
          `El puerto ${port} ya está ocupado. Cierra el servicio anterior y vuelve a intentarlo.`,
        ),
      );
    });
    server.listen({ host: "127.0.0.1", port }, () => {
      server.close(resolve);
    });
  });
}

/** Inicia un comando visible y conserva su referencia para el cierre coordinado. */
function startService(name, command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd ?? projectDirectory,
    env: options.env ?? process.env,
    stdio: "inherit",
  });
  child.serviceName = name;
  return child;
}

/** Inicia pnpm mediante Node para conservar argumentos seguros en Windows. */
function startPnpmService(name, args) {
  if (!pnpmScript) {
    throw new Error("Ejecuta este iniciador mediante `pnpm start`.");
  }
  return startService(name, process.execPath, [pnpmScript, ...args]);
}

/** Cierra un proceso y sus descendientes sin afectar servicios ajenos. */
function stopService(child) {
  if (!child.pid || child.exitCode !== null) return;
  if (isWindows) {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
    });
  } else {
    child.kill("SIGTERM");
  }
}

async function main() {
  if (!existsSync(pythonExecutable)) {
    throw new Error(
      "No existe `.venv`. Sigue primero la instalación indicada en el README.",
    );
  }

  await Promise.all([4173, 5174, 8000].map(assertPortAvailable));

  if (checkOnly) {
    console.log(
      "SpeakFlowAI está preparado: dependencias presentes y puertos libres.",
    );
    return;
  }

  const environment = {
    ...readLocalEnvironment(),
    ...process.env,
  };
  const children = [
    startService(
      "API",
      pythonExecutable,
      [
        "-m",
        "uvicorn",
        "speakflow_api.main:app",
        "--app-dir",
        "apps/api/src",
        "--host",
        "127.0.0.1",
        "--port",
        "8000",
        "--reload",
      ],
      { env: environment },
    ),
    startPnpmService("Documentación", ["--dir", "docs-site", "dev"]),
    startPnpmService("Web", [
      "--dir",
      "apps/web",
      "exec",
      "vite",
      "--host",
      "127.0.0.1",
      "--port",
      "4173",
      "--strictPort",
    ]),
  ];

  let shuttingDown = false;
  const shutdown = (exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("\nCerrando SpeakFlowAI...");
    for (const child of children.toReversed()) stopService(child);
    process.exit(exitCode);
  };

  for (const child of children) {
    child.once("error", (error) => {
      console.error(`${child.serviceName} no pudo iniciar: ${error.message}`);
      shutdown(1);
    });
    child.once("exit", (code) => {
      if (!shuttingDown) {
        console.error(
          `${child.serviceName} terminó inesperadamente (${code ?? 1}).`,
        );
        shutdown(code ?? 1);
      }
    });
  }

  process.once("SIGINT", () => shutdown(0));
  process.once("SIGTERM", () => shutdown(0));

  console.log("\nSpeakFlowAI se está iniciando desde una sola terminal:");
  console.log("  Aplicación:   http://127.0.0.1:4173/");
  console.log("  Documentación: http://127.0.0.1:4173/docs/");
  console.log("  API:           http://127.0.0.1:8000/");
  console.log("Presiona Ctrl + C para cerrar todo.\n");
}

main().catch((error) => {
  console.error(`No se pudo iniciar SpeakFlowAI: ${error.message}`);
  process.exit(1);
});

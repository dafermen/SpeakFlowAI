/**
 * Genera capturas reproducibles del producto con el Chrome instalado.
 *
 * Requisitos: web compilada en http://127.0.0.1:4173 y API sintética activa.
 * El flujo usa el perfil ficticio "Alex" en un contexto aislado del navegador;
 * nunca abre el perfil, las cookies ni el historial de la persona usuaria.
 */
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = join(projectRoot, "docs", "assets", "screenshots");
const chromePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
});

const context = await browser.newContext({
  colorScheme: "light",
  reducedMotion: "reduce",
  viewport: { height: 1000, width: 1440 },
});
const page = await context.newPage();

/** Guarda solo los píxeles de la aplicación, sin interfaz del navegador. */
async function capture(fileName) {
  await page.evaluate(() => window.scrollTo({ behavior: "instant", top: 0 }));
  await page.screenshot({
    animations: "disabled",
    path: join(outputDirectory, fileName),
  });
}

/** Pulsa un botón por su nombre accesible y espera a que la UI se estabilice. */
async function clickButton(name, index = 0) {
  await page.getByRole("button", { exact: true, name }).nth(index).click();
  await page.waitForTimeout(180);
}

try {
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });

  if (await page.getByPlaceholder("Tu nombre").isVisible()) {
    await page.getByPlaceholder("Tu nombre").fill("Alex");
    await clickButton("Continuar");
    await page.getByText("¿Cuál es tu nivel actual?").waitFor();
    await clickButton("B1 · Intermedio");
    await clickButton("Continuar");
    await page.getByText("¿Qué quieres conseguir?").waitFor();
    await clickButton("Hablar con más confianza");
    await clickButton("Continuar");
    await page.getByText("¿De qué te gustaría hablar?").waitFor();
    await clickButton("Vida diaria");
    await clickButton("Continuar");
    await page.getByText("Ajusta tu tutor.").waitFor();
    await clickButton("Continuar");
    await page.getByText("Listo, Alex.").waitFor();
    await clickButton("Entrar a SpeakFlowAI");
  }

  await page.getByText("Hola, Alex. Hablemos en inglés.").waitFor();
  await capture("home-desktop.png");

  await clickButton("Ver todas las prácticas");
  await page.getByText("Elige cómo quieres practicar.").waitFor();
  await capture("practice-catalog.png");

  await clickButton("Elegir práctica");
  await page.getByText("Antes de hablar").waitFor();
  await clickButton("Practicar escribiendo");
  await page.getByText("What would you like to order today?").waitFor();
  await page
    .getByPlaceholder("Type what you would say…")
    .fill("Could I have a medium latte, please?");
  await clickButton("Enviar respuesta");
  await page.getByText("What size would you prefer?").waitFor();
  await page
    .getByPlaceholder("Type what you would say…")
    .fill("Medium, please. That will be all, thank you.");
  await clickButton("Enviar respuesta");
  await page.getByText("Would you like anything else with that?").waitFor();
  await capture("conversation-desktop.png");

  await clickButton("Terminar");
  await page.getByText("Tu revisión está lista.").waitFor();
  await capture("review-desktop.png");

  await clickButton("Volver al inicio");
  await page.getByText("Hola, Alex. Hablemos en inglés.").waitFor();
  await page.setViewportSize({ height: 844, width: 390 });
  await capture("home-mobile.png");

  console.log(`Capturas creadas en ${outputDirectory}`);
} finally {
  await context.close();
  await browser.close();
}

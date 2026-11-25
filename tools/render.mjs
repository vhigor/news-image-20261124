import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const entryDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagePath = path.join(entryDir, "src", "frontpage.html");
const outputPath = path.join(entryDir, "entry.png");

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1024, height: 1024 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await page.goto(pathToFileURL(pagePath).href, { waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.screenshot({
    path: outputPath,
    type: "png",
    clip: { x: 0, y: 0, width: 1024, height: 1024 },
    animations: "disabled",
    caret: "hide",
  });
} finally {
  await browser.close();
}

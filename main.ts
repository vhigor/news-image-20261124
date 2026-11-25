import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourcePng = path.join(here, "entry.png");
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const outputPng = path.join(outputDir, "entry.png");
const maxBytes = 1024 * 1024;

function readPngSize(bytes: Buffer): { width: number; height: number } {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < signature.length; i += 1) {
    if (bytes[i] !== signature[i]) {
      throw new Error("entry.png is not a PNG file");
    }
  }
  if (bytes.length < 24 || bytes.toString("ascii", 12, 16) !== "IHDR") {
    throw new Error("entry.png is missing a PNG IHDR chunk");
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

const info = await stat(sourcePng);
if (info.size >= maxBytes) {
  throw new Error(`entry.png is ${info.size} bytes; the limit is under ${maxBytes} bytes`);
}

const bytes = await readFile(sourcePng);
const size = readPngSize(bytes);
if (size.width !== 1024 || size.height !== 1024) {
  throw new Error(`entry.png is ${size.width}x${size.height}; expected 1024x1024`);
}

await mkdir(outputDir, { recursive: true });
await copyFile(sourcePng, outputPng);

import { execSync } from "child_process";
import * as fs from "fs";

export interface ClipboardImage {
  width: number;
  height: number;
}

export class PngpasteNotFoundError extends Error {
  constructor() { super("pngpaste not installed. Run: brew install pngpaste"); }
}

const PNGPASTE_CANDIDATES = [
  "/opt/homebrew/bin/pngpaste",
  "/usr/local/bin/pngpaste",
];

function findPngpaste(): string {
  for (const p of PNGPASTE_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new PngpasteNotFoundError();
}

export function grabClipboardImageTo(outputPath: string): ClipboardImage | null {
  const bin = findPngpaste();
  try {
    execSync(`"${bin}" "${outputPath}"`, { stdio: "pipe" });
  } catch {
    return null;
  }
  const out = execSync(`/usr/bin/sips -g pixelWidth -g pixelHeight "${outputPath}"`, { stdio: "pipe" }).toString();
  const w = out.match(/pixelWidth:\s*(\d+)/);
  const h = out.match(/pixelHeight:\s*(\d+)/);
  return { width: w ? parseInt(w[1]) : 0, height: h ? parseInt(h[1]) : 0 };
}

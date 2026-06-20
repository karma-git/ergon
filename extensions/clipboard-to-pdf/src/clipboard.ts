import { execSync } from "child_process";
import * as fs from "fs";

export interface ClipboardImage {
  width: number;
  height: number;
}

export class PngpasteNotFoundError extends Error {
  constructor() {
    super("pngpaste not installed. Run: brew install pngpaste");
  }
}

// Raycast doesn't inherit shell PATH, so we probe common Homebrew locations
const PNGPASTE_CANDIDATES = [
  "/opt/homebrew/bin/pngpaste", // Apple Silicon
  "/usr/local/bin/pngpaste",    // Intel Mac
  "/usr/bin/pngpaste",
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

  const sipsOut = execSync(`/usr/bin/sips -g pixelWidth -g pixelHeight "${outputPath}"`, { stdio: "pipe" }).toString();
  const w = sipsOut.match(/pixelWidth:\s*(\d+)/);
  const h = sipsOut.match(/pixelHeight:\s*(\d+)/);
  return {
    width: w ? parseInt(w[1]) : 0,
    height: h ? parseInt(h[1]) : 0,
  };
}

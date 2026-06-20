import { closeMainWindow, showHUD, showToast, Toast } from "@raycast/api";
import { execSync } from "child_process";
import * as crypto from "crypto";
import * as path from "path";
import * as fs from "fs";
import { ensureFramesDir, framesDir, pushFrame } from "./lib/frames";

export default async function Command() {
  ensureFramesDir();

  // Close Raycast overlay before screenshot so it doesn't appear in the capture
  await closeMainWindow({ clearRootSearch: false });
  await new Promise((r) => setTimeout(r, 500));

  const id = crypto.randomUUID();
  const filename = `frame_${id}.png`;
  const dest = path.join(framesDir(), filename);

  try {
    // -i = interactive crosshair selection (standard macOS screenshot experience)
    execSync(`/usr/bin/screencapture -i "${dest}"`, { timeout: 30000, stdio: "pipe" });
  } catch {
    await showHUD("Screenshot cancelled");
    return;
  }

  if (!fs.existsSync(dest)) {
    await showHUD("Screenshot cancelled");
    return;
  }

  const out = execSync(`/usr/bin/sips -g pixelWidth -g pixelHeight "${dest}"`, { stdio: "pipe" }).toString();
  const w = out.match(/pixelWidth:\s*(\d+)/);
  const h = out.match(/pixelHeight:\s*(\d+)/);
  const width = w ? parseInt(w[1]) : 0;
  const height = h ? parseInt(h[1]) : 0;

  const frames = await pushFrame({ id, filename, width, height, timestamp: Date.now() });
  await showHUD(`✅ Frame ${frames.length} added  ${width}×${height}`);
}

import { showHUD, showToast, Toast } from "@raycast/api";
import * as path from "path";
import * as crypto from "crypto";
import { grabClipboardImageTo, PngpasteNotFoundError } from "./clipboard";
import { ensureFramesDir, framesDir, pushFrame } from "./utils";

export default async function Command() {
  ensureFramesDir();

  const id = crypto.randomUUID();
  const filename = `frame_${id}.png`;
  const dest = path.join(framesDir(), filename);

  let image;
  try {
    image = grabClipboardImageTo(dest);
  } catch (e) {
    if (e instanceof PngpasteNotFoundError) {
      await showToast({
        style: Toast.Style.Failure,
        title: "pngpaste not found",
        message: "brew install pngpaste",
      });
    }
    return;
  }

  if (!image) {
    await showHUD("⚠️ No image in clipboard — copy a frame first (Cmd+C in QuickTime)");
    return;
  }

  const frames = await pushFrame({ id, filename, width: image.width, height: image.height, timestamp: Date.now() });
  await showHUD(`✅ Frame ${frames.length} added  ${image.width}×${image.height}`);
}

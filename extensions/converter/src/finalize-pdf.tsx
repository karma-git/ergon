import { showHUD, showToast, Toast, open } from "@raycast/api";
import * as path from "path";
import { getFrames, clearFrames } from "./lib/frames";
import { framesPdf, framesPdfPath } from "./lib/pdf";

export default async function Command() {
  const frames = await getFrames();
  if (frames.length === 0) {
    await showHUD("⚠️ Queue is empty — add frames with 'Add Frame' first");
    return;
  }

  const outputPath = framesPdfPath();

  const toast = await showToast({
    style: Toast.Style.Animated,
    title: "Generating PDF…",
    message: `${frames.length} frame${frames.length > 1 ? "s" : ""}`,
  });

  try {
    await framesPdf(frames, outputPath);
    await clearFrames();
    toast.style = Toast.Style.Success;
    toast.title = "PDF saved to Desktop";
    toast.message = path.basename(outputPath);
    await open(outputPath);
  } catch (e) {
    toast.style = Toast.Style.Failure;
    toast.title = "Failed to generate PDF";
    toast.message = String(e);
  }
}

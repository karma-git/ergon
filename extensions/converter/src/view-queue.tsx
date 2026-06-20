import { List, Action, ActionPanel, Icon, Alert, confirmAlert, showToast, Toast, showHUD, open } from "@raycast/api";
import { useState, useEffect, useCallback } from "react";
import * as path from "path";
import * as os from "os";
import { getFrames, deleteFrame, moveFrame, clearFrames, framePath, FrameMeta } from "./lib/frames";
import { framesPdf } from "./lib/pdf";

export default function Command() {
  const [frames, setFrames] = useState<FrameMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setFrames(await getFrames());
    setIsLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  async function handleDelete(id: string) { await deleteFrame(id); await reload(); }
  async function handleMove(id: string, dir: "up" | "down") { await moveFrame(id, dir); await reload(); }

  async function handleClear() {
    const ok = await confirmAlert({
      title: "Clear all frames?",
      message: "This cannot be undone.",
      primaryAction: { title: "Clear All", style: Alert.ActionStyle.Destructive },
    });
    if (ok) { await clearFrames(); await reload(); }
  }

  async function handleGenerate() {
    if (!frames.length) { await showHUD("⚠️ No frames to export"); return; }
    const date = new Date().toISOString().slice(0, 10);
    const outputPath = path.join(os.homedir(), "Desktop", `frames-${date}.pdf`);
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Generating PDF…",
      message: `${frames.length} frame${frames.length > 1 ? "s" : ""}`,
    });
    try {
      await framesPdf(frames, outputPath);
      await clearFrames();
      await reload();
      toast.style = Toast.Style.Success;
      toast.title = "PDF saved to Desktop";
      toast.message = path.basename(outputPath);
      await open(outputPath);
    } catch (e) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed";
      toast.message = String(e);
    }
  }

  function relativeTime(ts: number): string {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  return (
    <List isLoading={isLoading} navigationTitle={`Frames (${frames.length})`}>
      {frames.length === 0 ? (
        <List.EmptyView
          title="No frames collected"
          description={'Copy a frame in QuickTime (Cmd+C) then run "Add Frame"'}
          icon={Icon.Camera}
        />
      ) : (
        frames.map((frame, idx) => (
          <List.Item
            key={frame.id}
            icon={{ source: framePath(frame.filename) }}
            title={`Frame ${idx + 1}`}
            subtitle={`${frame.width}×${frame.height}`}
            accessories={[{ text: relativeTime(frame.timestamp) }]}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action title="Generate PDF" icon={Icon.Document} shortcut={{ modifiers: ["cmd"], key: "g" }} onAction={handleGenerate} />
                  <Action title="Open Frame in Preview" icon={Icon.Eye} onAction={() => open(framePath(frame.filename))} />
                </ActionPanel.Section>
                <ActionPanel.Section title="Reorder">
                  <Action title="Move Up" icon={Icon.ChevronUp} shortcut={{ modifiers: ["cmd"], key: "arrowUp" }} onAction={() => handleMove(frame.id, "up")} />
                  <Action title="Move Down" icon={Icon.ChevronDown} shortcut={{ modifiers: ["cmd"], key: "arrowDown" }} onAction={() => handleMove(frame.id, "down")} />
                </ActionPanel.Section>
                <ActionPanel.Section title="Remove">
                  <Action title="Delete Frame" icon={Icon.Trash} style={Action.Style.Destructive} shortcut={{ modifiers: ["cmd"], key: "backspace" }} onAction={() => handleDelete(frame.id)} />
                  <Action title="Clear All Frames" icon={Icon.XMarkCircle} style={Action.Style.Destructive} onAction={handleClear} />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}

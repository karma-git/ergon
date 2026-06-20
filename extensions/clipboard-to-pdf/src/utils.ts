import { LocalStorage, environment } from "@raycast/api";
import * as fs from "fs";
import * as path from "path";

export interface FrameMeta {
  id: string;
  filename: string;
  width: number;
  height: number;
  timestamp: number;
}

const FRAMES_DIR = path.join(environment.supportPath, "frames");
const STORAGE_KEY = "frames-v1";

export function framesDir(): string {
  return FRAMES_DIR;
}

export function framePath(filename: string): string {
  return path.join(FRAMES_DIR, filename);
}

export function ensureFramesDir(): void {
  if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true });
  }
}

export async function getFrames(): Promise<FrameMeta[]> {
  const raw = await LocalStorage.getItem<string>(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FrameMeta[];
  } catch {
    return [];
  }
}

export async function saveFrames(frames: FrameMeta[]): Promise<void> {
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(frames));
}

export async function pushFrame(frame: FrameMeta): Promise<FrameMeta[]> {
  const frames = await getFrames();
  frames.push(frame);
  await saveFrames(frames);
  return frames;
}

export async function deleteFrame(id: string): Promise<void> {
  const frames = await getFrames();
  const frame = frames.find((f) => f.id === id);
  if (frame) {
    const p = framePath(frame.filename);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  await saveFrames(frames.filter((f) => f.id !== id));
}

export async function moveFrame(id: string, direction: "up" | "down"): Promise<void> {
  const frames = await getFrames();
  const idx = frames.findIndex((f) => f.id === id);
  if (idx < 0) return;
  const targetIdx = direction === "up" ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= frames.length) return;
  [frames[idx], frames[targetIdx]] = [frames[targetIdx], frames[idx]];
  await saveFrames(frames);
}

export async function clearFrames(): Promise<void> {
  const frames = await getFrames();
  for (const frame of frames) {
    const p = framePath(frame.filename);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  await saveFrames([]);
}

import { PDFDocument } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { framePath, FrameMeta } from "./frames";

export function framesPdfPath(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
  return path.join(os.homedir(), "Desktop", `frames-${date}-${time}.pdf`);
}

export async function framesPdf(frames: FrameMeta[], outputPath: string): Promise<void> {
  const doc = await PDFDocument.create();
  for (const frame of frames) {
    const p = framePath(frame.filename);
    if (!fs.existsSync(p)) continue;
    const image = await doc.embedPng(fs.readFileSync(p));
    const { width, height } = image.scale(1);
    doc.addPage([width, height]).drawImage(image, { x: 0, y: 0, width, height });
  }
  fs.writeFileSync(outputPath, await doc.save());
}

export async function imagesToPdf(imagePaths: string[], outputPath: string): Promise<void> {
  const doc = await PDFDocument.create();
  for (const imgPath of imagePaths) {
    const ext = path.extname(imgPath).toLowerCase();
    const bytes = fs.readFileSync(imgPath);
    let image;
    if (ext === ".png") {
      image = await doc.embedPng(bytes);
    } else if (ext === ".jpg" || ext === ".jpeg") {
      image = await doc.embedJpg(bytes);
    } else {
      continue;
    }
    const { width, height } = image.scale(1);
    doc.addPage([width, height]).drawImage(image, { x: 0, y: 0, width, height });
  }
  fs.writeFileSync(outputPath, await doc.save());
}

export async function mergePdfs(pdfPaths: string[], outputPath: string): Promise<void> {
  const merged = await PDFDocument.create();
  for (const pdfPath of pdfPaths) {
    const src = await PDFDocument.load(fs.readFileSync(pdfPath));
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  fs.writeFileSync(outputPath, await merged.save());
}

import { PDFDocument, degrees } from "pdf-lib";
import { execSync } from "child_process";
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

export async function splitPdf(pdfPath: string, outputDir: string): Promise<string[]> {
  const doc = await PDFDocument.load(fs.readFileSync(pdfPath));
  const count = doc.getPageCount();
  const outputs: string[] = [];
  for (let i = 0; i < count; i++) {
    const single = await PDFDocument.create();
    const [page] = await single.copyPages(doc, [i]);
    single.addPage(page);
    const out = path.join(outputDir, `page_${String(i + 1).padStart(3, "0")}.pdf`);
    fs.writeFileSync(out, await single.save());
    outputs.push(out);
  }
  return outputs;
}

export async function extractPages(pdfPath: string, indices: number[], outputPath: string): Promise<void> {
  const doc = await PDFDocument.load(fs.readFileSync(pdfPath));
  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(doc, indices);
  pages.forEach((p) => newDoc.addPage(p));
  fs.writeFileSync(outputPath, await newDoc.save());
}

export async function rotatePdf(pdfPath: string, angleDeg: number, outputPath: string): Promise<void> {
  const doc = await PDFDocument.load(fs.readFileSync(pdfPath));
  for (const page of doc.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angleDeg) % 360));
  }
  fs.writeFileSync(outputPath, await doc.save());
}

export async function pdfToImages(pdfPath: string, outputDir: string): Promise<string[]> {
  const doc = await PDFDocument.load(fs.readFileSync(pdfPath));
  const count = doc.getPageCount();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ergon-pdf-"));
  const outputs: string[] = [];
  try {
    for (let i = 0; i < count; i++) {
      const single = await PDFDocument.create();
      const [page] = await single.copyPages(doc, [i]);
      single.addPage(page);
      const tmpPdf = path.join(tmpDir, `page_${i}.pdf`);
      fs.writeFileSync(tmpPdf, await single.save());
      const outPng = path.join(outputDir, `page_${String(i + 1).padStart(3, "0")}.png`);
      execSync(`/usr/bin/sips -s format png "${tmpPdf}" --out "${outPng}"`, { stdio: "pipe" });
      outputs.push(outPng);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  return outputs;
}

import { PDFDocument } from "pdf-lib";
import * as fs from "fs";
import { framePath, FrameMeta } from "./utils";

export async function generatePdf(frames: FrameMeta[], outputPath: string): Promise<void> {
  const pdfDoc = await PDFDocument.create();

  for (const frame of frames) {
    const p = framePath(frame.filename);
    if (!fs.existsSync(p)) continue;

    const bytes = fs.readFileSync(p);
    const image = await pdfDoc.embedPng(bytes);
    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

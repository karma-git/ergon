import { Form, ActionPanel, Action, showToast, Toast, open } from "@raycast/api";
import { PDFDocument } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { extractPages } from "./lib/pdf";

interface Values {
  pdf: string[];
  pages: string;
  name: string;
}

function parsePageRange(input: string, total: number): number[] {
  const indices = new Set<number>();
  for (const part of input.split(",").map((s) => s.trim())) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((s) => parseInt(s.trim(), 10));
      if (!isNaN(a) && !isNaN(b)) {
        for (let i = a; i <= b; i++) if (i >= 1 && i <= total) indices.add(i - 1);
      }
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n) && n >= 1 && n <= total) indices.add(n - 1);
    }
  }
  return Array.from(indices).sort((a, b) => a - b);
}

export default function Command() {
  async function handleSubmit({ pdf, pages, name }: Values) {
    if (!pdf[0]) {
      await showToast({ style: Toast.Style.Failure, title: "No PDF selected" });
      return;
    }

    const doc = await PDFDocument.load(fs.readFileSync(pdf[0]));
    const indices = parsePageRange(pages, doc.getPageCount());

    if (!indices.length) {
      await showToast({ style: Toast.Style.Failure, title: "No valid pages in range" });
      return;
    }

    const filename = name.trim() || "extracted.pdf";
    const outputPath = path.join(os.homedir(), "Desktop", filename.endsWith(".pdf") ? filename : filename + ".pdf");
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Extracting…",
      message: `${indices.length} pages`,
    });

    try {
      await extractPages(pdf[0], indices, outputPath);
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

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Extract" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.FilePicker
        id="pdf"
        title="PDF file"
        allowMultipleSelection={false}
        canChooseFiles
        canChooseDirectories={false}
      />
      <Form.TextField id="pages" title="Page range" placeholder="1-3, 5, 7-9" />
      <Form.TextField id="name" title="Output filename" defaultValue="extracted.pdf" />
      <Form.Description text="Ranges like '1-3, 5, 8-10'. Pages are 1-indexed." />
    </Form>
  );
}

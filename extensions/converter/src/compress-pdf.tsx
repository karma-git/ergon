import { Form, ActionPanel, Action, showToast, Toast, open } from "@raycast/api";
import { execSync } from "child_process";
import * as path from "path";
import * as os from "os";

interface Values {
  pdf: string[];
  quality: string;
  name: string;
}

const GS_PATHS = ["/opt/homebrew/bin/gs", "/usr/local/bin/gs"];

function findGs(): string | null {
  for (const p of GS_PATHS) {
    try {
      execSync(`test -x "${p}"`, { stdio: "pipe" });
      return p;
    } catch {
      continue;
    }
  }
  return null;
}

export default function Command() {
  async function handleSubmit({ pdf, quality, name }: Values) {
    if (!pdf[0]) {
      await showToast({ style: Toast.Style.Failure, title: "No PDF selected" });
      return;
    }

    const gs = findGs();
    if (!gs) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Ghostscript not found",
        message: "Install with: brew install ghostscript",
      });
      return;
    }

    const filename = name.trim() || "compressed.pdf";
    const outputPath = path.join(os.homedir(), "Desktop", filename.endsWith(".pdf") ? filename : filename + ".pdf");
    const toast = await showToast({ style: Toast.Style.Animated, title: "Compressing…" });

    try {
      execSync(
        `"${gs}" -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/${quality} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${pdf[0]}"`,
        { stdio: "pipe" },
      );
      toast.style = Toast.Style.Success;
      toast.title = "Compressed PDF saved to Desktop";
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
          <Action.SubmitForm title="Compress" onSubmit={handleSubmit} />
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
      <Form.Dropdown id="quality" title="Quality">
        <Form.Dropdown.Item value="screen" title="Screen — smallest (72 dpi)" />
        <Form.Dropdown.Item value="ebook" title="Ebook — medium (150 dpi)" />
        <Form.Dropdown.Item value="printer" title="Printer — high (300 dpi)" />
      </Form.Dropdown>
      <Form.TextField id="name" title="Output filename" defaultValue="compressed.pdf" />
      <Form.Description text="Requires Ghostscript: brew install ghostscript" />
    </Form>
  );
}

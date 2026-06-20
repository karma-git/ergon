import { Form, ActionPanel, Action, showToast, Toast, open } from "@raycast/api";
import * as path from "path";
import * as os from "os";
import { mergePdfs } from "./lib/pdf";

interface Values {
  pdfs: string[];
  name: string;
}

export default function Command() {
  async function handleSubmit({ pdfs, name }: Values) {
    if (pdfs.length < 2) {
      await showToast({ style: Toast.Style.Failure, title: "Select at least 2 PDF files" });
      return;
    }

    const filename = name.trim() || "merged.pdf";
    const outputPath = path.join(os.homedir(), "Desktop", filename.endsWith(".pdf") ? filename : filename + ".pdf");

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Merging PDFs…",
      message: `${pdfs.length} files`,
    });

    try {
      await mergePdfs(pdfs, outputPath);
      toast.style = Toast.Style.Success;
      toast.title = "Merged PDF saved to Desktop";
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
          <Action.SubmitForm title="Merge" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.FilePicker
        id="pdfs"
        title="PDF files"
        allowMultipleSelection
        canChooseFiles
        canChooseDirectories={false}
      />
      <Form.TextField id="name" title="Output filename" defaultValue="merged.pdf" />
      <Form.Description text="PDFs are merged in the order they are selected. Output is saved to Desktop." />
    </Form>
  );
}

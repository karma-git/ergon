import { Form, ActionPanel, Action, showToast, Toast, open } from "@raycast/api";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { splitPdf } from "./lib/pdf";

interface Values {
  pdf: string[];
}

export default function Command() {
  async function handleSubmit({ pdf }: Values) {
    if (!pdf[0]) {
      await showToast({ style: Toast.Style.Failure, title: "No PDF selected" });
      return;
    }
    const basename = path.basename(pdf[0], ".pdf");
    const outputDir = path.join(os.homedir(), "Desktop", `${basename}_pages`);
    fs.mkdirSync(outputDir, { recursive: true });

    const toast = await showToast({ style: Toast.Style.Animated, title: "Splitting…" });

    try {
      const pages = await splitPdf(pdf[0], outputDir);
      toast.style = Toast.Style.Success;
      toast.title = `Split into ${pages.length} pages`;
      toast.message = path.basename(outputDir);
      await open(outputDir);
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
          <Action.SubmitForm title="Split" onSubmit={handleSubmit} />
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
      <Form.Description text="Each page is saved as a separate PDF in a new folder on Desktop." />
    </Form>
  );
}

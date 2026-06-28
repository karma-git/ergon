import { Form, ActionPanel, Action, showToast, Toast, open } from "@raycast/api";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { pdfToImages } from "./lib/pdf";

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
    const outputDir = path.join(os.homedir(), "Desktop", `${basename}_images`);
    fs.mkdirSync(outputDir, { recursive: true });

    const toast = await showToast({ style: Toast.Style.Animated, title: "Converting pages…" });

    try {
      const images = await pdfToImages(pdf[0], outputDir);
      toast.style = Toast.Style.Success;
      toast.title = `${images.length} PNG${images.length !== 1 ? "s" : ""} saved`;
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
          <Action.SubmitForm title="Convert to Images" onSubmit={handleSubmit} />
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
      <Form.Description text="Each page is exported as PNG. Results saved in a new folder on Desktop." />
    </Form>
  );
}

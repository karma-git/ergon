import { Form, ActionPanel, Action, showToast, Toast, open } from "@raycast/api";
import * as path from "path";
import * as os from "os";
import { rotatePdf } from "./lib/pdf";

interface Values {
  pdf: string[];
  angle: string;
  name: string;
}

export default function Command() {
  async function handleSubmit({ pdf, angle, name }: Values) {
    if (!pdf[0]) {
      await showToast({ style: Toast.Style.Failure, title: "No PDF selected" });
      return;
    }

    const filename = name.trim() || "rotated.pdf";
    const outputPath = path.join(os.homedir(), "Desktop", filename.endsWith(".pdf") ? filename : filename + ".pdf");
    const toast = await showToast({ style: Toast.Style.Animated, title: "Rotating…" });

    try {
      await rotatePdf(pdf[0], parseInt(angle, 10), outputPath);
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
          <Action.SubmitForm title="Rotate" onSubmit={handleSubmit} />
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
      <Form.Dropdown id="angle" title="Rotation">
        <Form.Dropdown.Item value="90" title="90° clockwise" />
        <Form.Dropdown.Item value="270" title="90° counter-clockwise" />
        <Form.Dropdown.Item value="180" title="180°" />
      </Form.Dropdown>
      <Form.TextField id="name" title="Output filename" defaultValue="rotated.pdf" />
    </Form>
  );
}

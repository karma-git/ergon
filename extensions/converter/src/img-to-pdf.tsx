import { Form, ActionPanel, Action, showToast, Toast, open } from "@raycast/api";
import * as path from "path";
import * as os from "os";
import { imagesToPdf } from "./lib/pdf";

interface Values {
  images: string[];
  name: string;
}

export default function Command() {
  async function handleSubmit({ images, name }: Values) {
    if (!images.length) {
      await showToast({ style: Toast.Style.Failure, title: "No images selected" });
      return;
    }

    const filename = name.trim() || "images.pdf";
    const outputPath = path.join(os.homedir(), "Desktop", filename.endsWith(".pdf") ? filename : filename + ".pdf");

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Creating PDF…",
      message: `${images.length} image${images.length > 1 ? "s" : ""}`,
    });

    try {
      const sorted = [...images].sort();
      await imagesToPdf(sorted, outputPath);
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
          <Action.SubmitForm title="Create PDF" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.FilePicker
        id="images"
        title="Images (PNG, JPG)"
        allowMultipleSelection
        canChooseFiles
        canChooseDirectories={false}
      />
      <Form.TextField id="name" title="Output filename" defaultValue="images.pdf" />
      <Form.Description text="Images are sorted by filename. Output is saved to Desktop." />
    </Form>
  );
}

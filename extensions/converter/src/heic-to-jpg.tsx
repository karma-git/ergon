import { Form, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface Values {
  folder: string[];
}

export default function Command() {
  async function handleSubmit({ folder }: Values) {
    const folderPath = folder[0];
    if (!folderPath) {
      await showToast({ style: Toast.Style.Failure, title: "No folder selected" });
      return;
    }

    const heicFiles = fs.readdirSync(folderPath).filter((f) => f.toLowerCase().endsWith(".heic"));

    if (!heicFiles.length) {
      await showToast({ style: Toast.Style.Failure, title: "No HEIC files found in folder" });
      return;
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Converting…",
      message: `${heicFiles.length} file${heicFiles.length > 1 ? "s" : ""}`,
    });

    try {
      for (const file of heicFiles) {
        const input = path.join(folderPath, file);
        const output = path.join(folderPath, file.replace(/\.heic$/i, ".jpg"));
        execSync(`/usr/bin/sips -s format jpeg "${input}" --out "${output}"`, { stdio: "pipe" });
      }
      toast.style = Toast.Style.Success;
      toast.title = `Converted ${heicFiles.length} file${heicFiles.length > 1 ? "s" : ""}`;
      toast.message = "JPGs saved next to originals";
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
          <Action.SubmitForm title="Convert to JPG" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.FilePicker
        id="folder"
        title="Folder with HEIC files"
        allowMultipleSelection={false}
        canChooseFiles={false}
        canChooseDirectories
      />
      <Form.Description text="Converts all .HEIC files in the folder. JPGs are saved alongside originals." />
    </Form>
  );
}

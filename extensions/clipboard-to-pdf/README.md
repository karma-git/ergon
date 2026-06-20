# Clipboard to PDF

Collect video frames from clipboard one by one and export as a single PDF.

**Use case:** pause a video in QuickTime, copy a frame with `Cmd+C`, repeat for key moments, then export all frames as a PDF for reference.

## Requirements

```bash
brew install pngpaste
```

## Commands

| Command | Description |
|---|---|
| **Add Frame** | Grab image from clipboard and add to queue (assign a hotkey for fastest workflow) |
| **View Frames** | Browse collected frames — delete, reorder, or generate PDF |
| **Generate PDF** | Export all frames as PDF to Desktop, then clear the queue |

## Workflow

1. Pause video in QuickTime → `Cmd+C`
2. Open Raycast → **Add Frame**
3. Repeat for each frame you want
4. Open Raycast → **Generate PDF**

PDF is saved to Desktop as `frames-YYYY-MM-DD.pdf` and opens automatically.

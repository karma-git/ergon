# ergon

ἔργον · small tools for daily work — personal [Raycast](https://raycast.com) extensions.

## Extensions

| Extension | Commands |
|---|---|
| [converter](extensions/converter) | Images→PDF, HEIC→JPG, Merge, Split, Extract pages, Rotate, PDF→Images, Compress, Clipboard frames→PDF |

## Installation

Extensions are not published to the Raycast Store — install them locally:

```bash
git clone https://github.com/karma-git/ergon
cd ergon/extensions/<extension-name>
npm install
```

Then in Raycast: **Extensions → + → Import Extension** → select the extension folder.

### Requirements

- [Raycast](https://raycast.com) (free)
- Node.js 18+
- `compress-pdf` command requires Ghostscript: `brew install ghostscript`

# DOMDiff

DOMDiff is a developer tool designed as a Chrome Extension to help compare two versions of a webpage both visually and structurally. 

## Features

**Visual Diff:**
- Upload "Before" and "After" images.
- Interactive slider, overlay (with pixel differences highlighted in red), and side-by-side viewing modes.
- Diff statistics badge with pixel logic powered by `pixelmatch` via canvas processing.

**DOM Diff:**
- Paste raw HTML strings or enter live webpage URLs (powered by direct fetching).
- View a fully parsed representation of changes side-by-side using an interactive node graph (`@xyflow/react`).
- See distinct DOM manipulation states per node: Added (Green), Removed (Red), Modified (Yellow), or Unchanged (Gray).
- Click on any node to view a detailed slide-out properties sidebar to inspect tag, status, attributes, inner text, and structural path.

## Local Development

The project is built on **React 18**, **TypeScript**, **Tailwind CSS v3**, and **Vite**.

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build the project for production
npm run build
```

## Installing the Chrome Extension

Since DOMDiff functions securely via a browser extension (Manifest V3), here's how to load it:

1. Run `npm run build` in the repository folder. This will output all extension files into the `dist` folder.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **"Developer mode"** in the top right.
4. Click **"Load unpacked"** and select the `/dist` folder inside this repository.
5. DOMDiff is now installed and accessible by clicking the extension icon. Enjoy comparing your DOM!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

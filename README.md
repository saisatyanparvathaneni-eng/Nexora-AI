# Nexora AI — Standalone Website

This folder contains the complete standalone Nexora AI demonstration website. It is built with plain HTML5, CSS3, and vanilla JavaScript, so it can be uploaded directly to a GitHub repository or served from any static hosting provider.

## Files

- `index.html` — main webpage and all semantic page markup
- `styles.css` — responsive Archive / signal visual system
- `script.js` — navigation, theme switching, filters, dialogs, demos, validation, accordions, and notifications
- `favicon.svg` — local Nexora AI favicon
- `manus-routes.json` — route declaration for the root page
- `screenshots/desktop-full-page.png` — desktop visual reference
- `screenshots/mobile-full-page.png` — mobile visual reference

## Test in another browser

### Option 1: Open directly

Double-click `index.html` or open it from your browser's File > Open menu. Most interactions work directly from the file system.

### Option 2: Use a local HTTP server

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

Using a local server is recommended because it matches static hosting behavior more closely.

## GitHub upload

Create a repository, then upload all files and folders in this package with `index.html` at the repository root. GitHub Pages can serve the site directly from the root of the main branch or from a configured `/docs` folder.

## Important disclosure

The AI playground, DataMind, AutoFlow, counters, article content, contact submission, team information, and product results are demonstration interactions implemented in JavaScript. They do not connect to a real AI provider, database, email service, or production backend. No API keys are included.

## Browser support

The page is designed for current versions of Chrome, Edge, Firefox, and Safari on desktop and mobile screen sizes. JavaScript is required for the interactive demonstrations.

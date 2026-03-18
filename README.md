# ChatGPT Selected Conversation Archiver

A Chrome extension that lets you track and archive selected ChatGPT conversations locally.

**Status:** MVP Phase 1 — project skeleton with popup UI and tracking.

## Setup

```bash
npm install
```

## Build

```bash
npm run build
```

This outputs the extension to `dist/`.

## Load in Chrome

1. Run `npm run build`
2. Open `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the `dist/` folder

## Development

```bash
npm run dev
```

Starts Vite dev server with HMR (via crxjs). After starting, load the `dist/` folder as an unpacked extension.

## Project Structure

```
src/
  background/   - Service worker (message handling, future capture coordination)
  content/      - Content script injected into ChatGPT pages
  popup/        - React popup UI (tab detection, track/stop controls)
  archive/      - DB layer stub (future IndexedDB/Dexie storage)
  shared/       - Types, storage helpers, page context parsing
```

## What Works (Phase 1)

- Popup detects whether the active tab is on chatgpt.com or chat.openai.com
- Extracts conversation ID from URL
- Track / Stop buttons persist conversation IDs via `chrome.storage.local`
- Lists all tracked conversations in popup
- Content script and background service worker stubs are in place

## Next Steps

- Phase 2: DOM observation and conversation capture pipeline
- Phase 3: IndexedDB storage via Dexie for full conversation snapshots
- Phase 4: Export / search / management UI

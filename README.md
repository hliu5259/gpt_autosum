# ChatGPT Selected Conversation Archiver

A Chrome extension that lets you track and archive selected ChatGPT conversations locally.

**Status:** Feature-complete (Phase 1–4 implemented)

## Features

- **Track conversations** — detect and track ChatGPT conversations from the popup
- **Capture snapshots** — capture the full conversation content from the page DOM on demand
- **IndexedDB storage** — snapshots are stored locally via Dexie (IndexedDB)
- **Export** — download snapshots as JSON or Markdown
- **Search** — filter tracked conversations by title or ID
- **Manage** — view, expand, and delete snapshots per conversation

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
  background/   - Service worker (message routing, DB operations)
  content/      - Content script (DOM scraping for conversation capture)
  popup/        - React popup UI (track, capture, search, export)
  archive/      - Dexie DB layer + export helpers
  shared/       - Types, storage helpers, page context parsing
```

## How It Works

1. **Popup** detects whether the active tab is on chatgpt.com/chat.openai.com
2. User clicks **Track** to start tracking a conversation
3. User clicks **Capture** to snapshot the current conversation content
4. Content script scrapes messages from the ChatGPT DOM
5. Background worker saves the snapshot to IndexedDB
6. User can expand tracked conversations to see snapshots, export, or delete them

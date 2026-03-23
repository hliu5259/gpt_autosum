# Implementation Plan: Complete ChatGPT Conversation Archiver

## Overview

Complete the remaining Phase 2-4 of the Chrome extension. The Phase 1 skeleton is done (popup UI, URL parsing, chrome.storage tracking). We need: DOM conversation capture, IndexedDB persistence, and export/search UI.

---

## Step 1: Add Dexie dependency

- `npm install dexie` — lightweight IndexedDB wrapper
- No other new dependencies needed

---

## Step 2: Define message protocol & extended types

**File: `src/shared/types.ts`**

Add message types for communication between content ↔ background ↔ popup:

```ts
// Message types
export type Message =
  | { type: "CONTENT_READY"; url: string }
  | { type: "CAPTURE_REQUEST"; conversationId: string }
  | { type: "CAPTURE_RESULT"; conversationId: string; messages: ConversationMessage[]; title: string }
  | { type: "GET_SNAPSHOTS"; conversationId: string }
  | { type: "SNAPSHOTS_RESULT"; snapshots: ConversationSnapshot[] }
  | { type: "DELETE_SNAPSHOTS"; conversationId: string };

// A single message in a conversation
export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;  // text content (HTML stripped)
}

// Full snapshot stored in IndexedDB
export interface ConversationSnapshot {
  id?: number;  // auto-increment key
  conversationId: string;
  title: string;
  capturedAt: number;
  messages: ConversationMessage[];
}
```

---

## Step 3: Implement IndexedDB storage via Dexie (Phase 3)

**File: `src/archive/db.ts`** — replace stubs with real implementation

- Create Dexie database `ConversationArchiveDB` with a `snapshots` table
- Schema: `++id, conversationId, capturedAt`
- Implement: `saveSnapshot()`, `getSnapshots(conversationId)`, `getAllSnapshots()`, `deleteSnapshots(conversationId)`, `exportSnapshot(id)`

---

## Step 4: Content script — DOM conversation extraction (Phase 2)

**File: `src/content/index.ts`** — the core capture logic

ChatGPT renders conversations in `article` elements (or `div[data-message-author-role]`). The content script will:

1. Listen for `CAPTURE_REQUEST` messages from background
2. On request, scrape the current page DOM:
   - Extract conversation title from `<title>` or the heading element
   - Find all message turn containers (ChatGPT uses `[data-message-author-role]` attributes)
   - For each message: extract role + text content
3. Send `CAPTURE_RESULT` back to background with structured data

Strategy: **On-demand capture** (triggered by user clicking "Capture" in popup), not continuous MutationObserver. This is simpler, more reliable, and avoids performance overhead.

---

## Step 5: Background service worker — message router

**File: `src/background/index.ts`**

- Handle `CAPTURE_RESULT` from content script → save to IndexedDB via `db.saveSnapshot()`
- Handle `GET_SNAPSHOTS` from popup → query DB → return results
- Handle `DELETE_SNAPSHOTS` from popup → delete from DB
- Forward `CAPTURE_REQUEST` from popup → relay to content script in the correct tab

---

## Step 6: Enhanced Popup UI (Phase 4)

**File: `src/popup/Popup.tsx`** + **`src/popup/popup.css`**

Enhance the existing popup with:

1. **"Capture Now" button** — for tracked conversations, trigger a snapshot capture
2. **Snapshot list** — show captured snapshots (date + message count) for each tracked conversation
3. **Export button** — export a snapshot as JSON or Markdown
4. **Delete button** — delete snapshots for a conversation
5. **Simple search** — text filter across tracked conversation titles

UI additions:
- Expandable conversation items in the tracked list (click to see snapshots)
- Each snapshot shows: timestamp, message count, export/delete actions
- Search input at top of tracked list

---

## Step 7: Export functionality

**File: `src/archive/export.ts`** (new)

- `exportAsJSON(snapshot)` → download as `.json`
- `exportAsMarkdown(snapshot)` → format as readable markdown, download as `.md`
- Uses `URL.createObjectURL` + programmatic `<a>` click for download

---

## Step 8: Update README

Update the README to reflect completed status and usage instructions.

---

## File Change Summary

| File | Action |
|------|--------|
| `package.json` | Add `dexie` dependency |
| `src/shared/types.ts` | Add message types, ConversationMessage, update ConversationSnapshot |
| `src/archive/db.ts` | Replace stubs with Dexie implementation |
| `src/archive/export.ts` | New — export helpers |
| `src/content/index.ts` | Rewrite — DOM scraping + message handling |
| `src/background/index.ts` | Rewrite — message routing + DB operations |
| `src/popup/Popup.tsx` | Enhance — capture, snapshots, export, search |
| `src/popup/popup.css` | Extend — styles for new UI elements |
| `README.md` | Update status and docs |

---

## Execution Order

Steps 1-3 first (foundation), then 4-5 (capture pipeline), then 6-7 (UI + export), finally 8 (docs). Each step will be committed separately.

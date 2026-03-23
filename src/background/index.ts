/**
 * Background service worker.
 *
 * Routes messages between popup and content scripts,
 * and handles IndexedDB operations via the archive DB layer.
 */

import {
  saveSnapshot,
  getSnapshots,
  getAllSnapshots,
  deleteSnapshots,
} from "@archive/db";
import type { Message } from "@shared/types";

chrome.runtime.onInstalled.addListener(() => {
  console.log("[background] ChatGPT Conversation Archiver installed");
});

chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendResponse) => {
    handleMessage(message, sender)
      .then(sendResponse)
      .catch((err) => {
        console.error("[background] error handling message", err);
        sendResponse({ error: String(err) });
      });
    // Return true to keep the message channel open for async response
    return true;
  }
);

async function handleMessage(
  message: Message,
  _sender: chrome.runtime.MessageSender
): Promise<unknown> {
  switch (message.type) {
    case "CONTENT_READY": {
      console.log("[background] content script ready at", message.url);
      return { ok: true };
    }

    case "CAPTURE_REQUEST": {
      // Forward the capture request to the content script in the active tab
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const tab = tabs[0];
      if (!tab?.id) return { error: "No active tab" };

      const response = await chrome.tabs.sendMessage(tab.id, message);

      // If content script returned a CAPTURE_RESULT, save to DB
      if (response?.type === "CAPTURE_RESULT") {
        const id = await saveSnapshot({
          conversationId: response.conversationId,
          title: response.title,
          capturedAt: Date.now(),
          messages: response.messages,
        });
        return { ok: true, snapshotId: id };
      }

      return { error: "Unexpected response from content script" };
    }

    case "GET_SNAPSHOTS": {
      const snapshots = await getSnapshots(message.conversationId);
      return { type: "SNAPSHOTS_RESULT", snapshots };
    }

    case "GET_ALL_SNAPSHOTS": {
      const snapshots = await getAllSnapshots();
      return { type: "ALL_SNAPSHOTS_RESULT", snapshots };
    }

    case "DELETE_SNAPSHOTS": {
      await deleteSnapshots(message.conversationId);
      return { ok: true };
    }

    default:
      console.log("[background] unhandled message", message);
      return { ok: true };
  }
}

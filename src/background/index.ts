/**
 * Background service worker.
 *
 * Currently minimal — listens for installation and logs. Future phases
 * will coordinate capture triggers, alarms, and message passing.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("[background] ChatGPT Conversation Archiver installed");
});

// Placeholder listener for messages from popup / content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("[background] received message", message);
  sendResponse({ ok: true });
});

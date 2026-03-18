/**
 * Content script injected into ChatGPT pages.
 *
 * Phase 1: just announces itself. Future phases will observe DOM mutations
 * and relay conversation data to the background worker.
 */

console.log("[content] ChatGPT Conversation Archiver content script loaded");

// Notify background that content script is alive
chrome.runtime.sendMessage({ type: "CONTENT_READY", url: location.href });

/**
 * Content script injected into ChatGPT pages.
 *
 * Listens for CAPTURE_REQUEST messages and scrapes the current conversation
 * from the DOM, returning structured message data.
 */

import type { ConversationMessage, Message } from "@shared/types";

console.log("[content] ChatGPT Conversation Archiver content script loaded");

// Notify background that content script is alive
chrome.runtime.sendMessage({ type: "CONTENT_READY", url: location.href });

// Listen for capture requests from background
chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    if (message.type === "CAPTURE_REQUEST") {
      const result = captureConversation();
      const response: Message = {
        type: "CAPTURE_RESULT",
        conversationId: message.conversationId,
        title: result.title,
        messages: result.messages,
      };
      sendResponse(response);
    }
    // Return true to keep the message channel open for async response
    return true;
  }
);

function captureConversation(): {
  title: string;
  messages: ConversationMessage[];
} {
  // Extract title from page
  const title = extractTitle();

  // Extract messages from DOM
  const messages = extractMessages();

  console.log(
    `[content] Captured: "${title}" with ${messages.length} messages`
  );
  return { title, messages };
}

function extractTitle(): string {
  // Try the page title first (ChatGPT sets it to the conversation title)
  const pageTitle = document.title?.trim();
  if (pageTitle && pageTitle !== "ChatGPT") {
    return pageTitle;
  }

  // Fallback: try to find a heading in the chat
  const heading = document.querySelector("h1");
  if (heading?.textContent?.trim()) {
    return heading.textContent.trim();
  }

  return "Untitled Conversation";
}

function extractMessages(): ConversationMessage[] {
  const messages: ConversationMessage[] = [];

  // ChatGPT uses [data-message-author-role] to mark message containers
  const messageEls = document.querySelectorAll(
    "[data-message-author-role]"
  );

  for (const el of messageEls) {
    const role = el.getAttribute("data-message-author-role");
    if (!role || (role !== "user" && role !== "assistant")) continue;

    // The message content is inside the element — get text content
    // ChatGPT wraps assistant messages in a markdown container
    const contentEl =
      el.querySelector(".markdown") ??
      el.querySelector(".whitespace-pre-wrap") ??
      el;

    const content = contentEl.textContent?.trim() ?? "";
    if (!content) continue;

    messages.push({
      role: role as "user" | "assistant",
      content,
    });
  }

  // Fallback: if no [data-message-author-role] found, try article-based extraction
  if (messages.length === 0) {
    const articles = document.querySelectorAll("article");
    let roleToggle: "user" | "assistant" = "user";
    for (const article of articles) {
      const content = article.textContent?.trim() ?? "";
      if (!content) continue;
      messages.push({ role: roleToggle, content });
      roleToggle = roleToggle === "user" ? "assistant" : "user";
    }
  }

  return messages;
}

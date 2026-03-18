/** Identifies a ChatGPT conversation by its URL-based id. */
export interface TrackedConversation {
  /** The conversation UUID extracted from the ChatGPT URL */
  id: string;
  /** Human-readable title, if we can extract it later */
  title?: string;
  /** When the user first started tracking this conversation */
  trackedAt: number;
  /** Origin domain (chatgpt.com or chat.openai.com) */
  origin: string;
}

/** Page context detected from the active tab */
export interface PageContext {
  /** Whether the tab is on a supported ChatGPT domain */
  isChatGPT: boolean;
  /** Conversation id parsed from the URL, if any */
  conversationId: string | null;
  /** The full URL of the tab */
  url: string;
  /** The origin domain */
  origin: string;
}

/** Storage keys used in chrome.storage.local */
export const STORAGE_KEYS = {
  TRACKED_CONVERSATIONS: "tracked_conversations",
} as const;

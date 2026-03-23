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

/** A single message in a conversation */
export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/** Full snapshot stored in IndexedDB */
export interface ConversationSnapshot {
  id?: number;
  conversationId: string;
  title: string;
  capturedAt: number;
  messages: ConversationMessage[];
}

/** Message types for communication between content <-> background <-> popup */
export type Message =
  | { type: "CONTENT_READY"; url: string }
  | { type: "CAPTURE_REQUEST"; conversationId: string }
  | {
      type: "CAPTURE_RESULT";
      conversationId: string;
      title: string;
      messages: ConversationMessage[];
    }
  | { type: "GET_SNAPSHOTS"; conversationId: string }
  | { type: "SNAPSHOTS_RESULT"; snapshots: ConversationSnapshot[] }
  | { type: "DELETE_SNAPSHOTS"; conversationId: string }
  | { type: "GET_ALL_SNAPSHOTS" }
  | { type: "ALL_SNAPSHOTS_RESULT"; snapshots: ConversationSnapshot[] };

/** Storage keys used in chrome.storage.local */
export const STORAGE_KEYS = {
  TRACKED_CONVERSATIONS: "tracked_conversations",
} as const;

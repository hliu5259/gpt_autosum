import { PageContext } from "./types";

const CHATGPT_DOMAINS = ["chatgpt.com", "chat.openai.com"];
const CONVERSATION_PATH_RE = /^\/(?:c\/)?([a-f0-9-]{36})/;

/** Parse a tab URL into a PageContext */
export function parsePageContext(url: string): PageContext {
  try {
    const parsed = new URL(url);
    const origin = parsed.hostname;
    const isChatGPT = CHATGPT_DOMAINS.includes(origin);
    const match = parsed.pathname.match(CONVERSATION_PATH_RE);
    return {
      isChatGPT,
      conversationId: match ? match[1] : null,
      url,
      origin,
    };
  } catch {
    return { isChatGPT: false, conversationId: null, url, origin: "" };
  }
}

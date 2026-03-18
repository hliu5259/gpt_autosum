import React, { useEffect, useState } from "react";
import { parsePageContext } from "@shared/page-context";
import {
  getTrackedConversations,
  trackConversation,
  untrackConversation,
  isTracked,
} from "@shared/storage";
import type { PageContext, TrackedConversation } from "@shared/types";

export function Popup() {
  const [ctx, setCtx] = useState<PageContext | null>(null);
  const [tracked, setTracked] = useState(false);
  const [allTracked, setAllTracked] = useState<TrackedConversation[]>([]);

  // Detect active tab on mount
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (!tab?.url) return;
      const pageCtx = parsePageContext(tab.url);
      setCtx(pageCtx);

      if (pageCtx.conversationId) {
        setTracked(await isTracked(pageCtx.conversationId));
      }
    });
    loadAllTracked();
  }, []);

  async function loadAllTracked() {
    setAllTracked(await getTrackedConversations());
  }

  async function handleTrack() {
    if (!ctx?.conversationId) return;
    await trackConversation({
      id: ctx.conversationId,
      trackedAt: Date.now(),
      origin: ctx.origin,
    });
    setTracked(true);
    loadAllTracked();
  }

  async function handleStop() {
    if (!ctx?.conversationId) return;
    await untrackConversation(ctx.conversationId);
    setTracked(false);
    loadAllTracked();
  }

  if (!ctx) {
    return (
      <div className="popup">
        <h1>ChatGPT Archiver</h1>
        <div className="status info">Loading...</div>
      </div>
    );
  }

  return (
    <div className="popup">
      <h1>ChatGPT Archiver</h1>

      {!ctx.isChatGPT && (
        <div className="status warn">
          Not on a ChatGPT page. Navigate to chatgpt.com to use this extension.
        </div>
      )}

      {ctx.isChatGPT && !ctx.conversationId && (
        <div className="status info">
          On ChatGPT, but no conversation is open. Open a conversation to track
          it.
        </div>
      )}

      {ctx.isChatGPT && ctx.conversationId && (
        <>
          <div className="status ok">
            {tracked ? "Tracking this conversation" : "Conversation detected"}
          </div>
          <div className="conv-id">{ctx.conversationId}</div>
          <div className="actions">
            <button
              className="btn-track"
              onClick={handleTrack}
              disabled={tracked}
            >
              Track
            </button>
            <button
              className="btn-stop"
              onClick={handleStop}
              disabled={!tracked}
            >
              Stop
            </button>
          </div>
        </>
      )}

      {allTracked.length > 0 && (
        <div className="tracked-list">
          <h2>Tracked conversations ({allTracked.length})</h2>
          <ul>
            {allTracked.map((c) => (
              <li key={c.id}>{c.title ?? c.id}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

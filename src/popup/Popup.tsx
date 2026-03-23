import React, { useEffect, useState } from "react";
import { parsePageContext } from "@shared/page-context";
import {
  getTrackedConversations,
  trackConversation,
  untrackConversation,
  isTracked,
} from "@shared/storage";
import { exportAsJSON, exportAsMarkdown } from "@archive/export";
import type {
  PageContext,
  TrackedConversation,
  ConversationSnapshot,
} from "@shared/types";

export function Popup() {
  const [ctx, setCtx] = useState<PageContext | null>(null);
  const [tracked, setTracked] = useState(false);
  const [allTracked, setAllTracked] = useState<TrackedConversation[]>([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<ConversationSnapshot[]>([]);
  const [capturing, setCapturing] = useState(false);

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

  async function handleCapture() {
    if (!ctx?.conversationId) return;
    setCapturing(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: "CAPTURE_REQUEST",
        conversationId: ctx.conversationId,
      });
      if (response?.ok) {
        // Update title in tracked list if we got one
        loadAllTracked();
        // Refresh snapshots if this conversation is expanded
        if (expandedId === ctx.conversationId) {
          loadSnapshots(ctx.conversationId);
        }
      }
    } finally {
      setCapturing(false);
    }
  }

  async function loadSnapshots(conversationId: string) {
    const response = await chrome.runtime.sendMessage({
      type: "GET_SNAPSHOTS",
      conversationId,
    });
    if (response?.snapshots) {
      setSnapshots(response.snapshots);
    }
  }

  async function handleExpand(conversationId: string) {
    if (expandedId === conversationId) {
      setExpandedId(null);
      setSnapshots([]);
      return;
    }
    setExpandedId(conversationId);
    loadSnapshots(conversationId);
  }

  async function handleDeleteSnapshots(conversationId: string) {
    await chrome.runtime.sendMessage({
      type: "DELETE_SNAPSHOTS",
      conversationId,
    });
    setSnapshots([]);
  }

  const filteredTracked = allTracked.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      (c.title && c.title.toLowerCase().includes(q))
    );
  });

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
              className="btn-capture"
              onClick={handleCapture}
              disabled={capturing}
            >
              {capturing ? "Capturing..." : "Capture"}
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
          <input
            type="text"
            className="search-input"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ul>
            {filteredTracked.map((c) => (
              <li key={c.id}>
                <div
                  className="conv-item"
                  onClick={() => handleExpand(c.id)}
                >
                  <span className="conv-title">{c.title ?? c.id}</span>
                  <span className="conv-arrow">
                    {expandedId === c.id ? "\u25BC" : "\u25B6"}
                  </span>
                </div>

                {expandedId === c.id && (
                  <div className="snapshot-panel">
                    {snapshots.length === 0 ? (
                      <div className="snapshot-empty">No snapshots yet</div>
                    ) : (
                      <div className="snapshot-list">
                        {snapshots.map((s) => (
                          <div key={s.id} className="snapshot-item">
                            <div className="snapshot-meta">
                              <span>
                                {new Date(s.capturedAt).toLocaleString()}
                              </span>
                              <span>{s.messages.length} msgs</span>
                            </div>
                            <div className="snapshot-actions">
                              <button
                                className="btn-sm"
                                onClick={() => exportAsJSON(s)}
                              >
                                JSON
                              </button>
                              <button
                                className="btn-sm"
                                onClick={() => exportAsMarkdown(s)}
                              >
                                MD
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => handleDeleteSnapshots(c.id)}
                      disabled={snapshots.length === 0}
                    >
                      Delete all snapshots
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

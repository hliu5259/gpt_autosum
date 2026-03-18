/**
 * Local DB layer stub.
 *
 * This module will eventually use IndexedDB (via Dexie or idb) to store
 * full conversation snapshots and message-level data. For now it's a
 * placeholder that logs calls and resolves immediately.
 */

export interface ConversationSnapshot {
  conversationId: string;
  capturedAt: number;
  /** Raw HTML or structured data — TBD */
  payload: unknown;
}

/** Stub: save a conversation snapshot */
export async function saveSnapshot(
  _snapshot: ConversationSnapshot
): Promise<void> {
  console.log("[db stub] saveSnapshot called", _snapshot.conversationId);
}

/** Stub: get all snapshots for a conversation */
export async function getSnapshots(
  _conversationId: string
): Promise<ConversationSnapshot[]> {
  console.log("[db stub] getSnapshots called", _conversationId);
  return [];
}

/** Stub: delete all snapshots for a conversation */
export async function deleteSnapshots(
  _conversationId: string
): Promise<void> {
  console.log("[db stub] deleteSnapshots called", _conversationId);
}

import { TrackedConversation, STORAGE_KEYS } from "./types";

/** Get all tracked conversations from chrome.storage.local */
export async function getTrackedConversations(): Promise<
  TrackedConversation[]
> {
  const result = await chrome.storage.local.get(
    STORAGE_KEYS.TRACKED_CONVERSATIONS
  );
  return (result[STORAGE_KEYS.TRACKED_CONVERSATIONS] as TrackedConversation[] | undefined) ?? [];
}

/** Save tracked conversations to chrome.storage.local */
export async function setTrackedConversations(
  conversations: TrackedConversation[]
): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEYS.TRACKED_CONVERSATIONS]: conversations,
  });
}

/** Add a conversation to the tracked list (no-op if already tracked) */
export async function trackConversation(
  conv: TrackedConversation
): Promise<void> {
  const existing = await getTrackedConversations();
  if (existing.some((c) => c.id === conv.id)) return;
  await setTrackedConversations([...existing, conv]);
}

/** Remove a conversation from the tracked list */
export async function untrackConversation(id: string): Promise<void> {
  const existing = await getTrackedConversations();
  await setTrackedConversations(existing.filter((c) => c.id !== id));
}

/** Check if a conversation is currently tracked */
export async function isTracked(id: string): Promise<boolean> {
  const existing = await getTrackedConversations();
  return existing.some((c) => c.id === id);
}

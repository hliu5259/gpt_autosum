import Dexie, { type Table } from "dexie";
import type { ConversationSnapshot } from "@shared/types";

class ArchiveDB extends Dexie {
  snapshots!: Table<ConversationSnapshot, number>;

  constructor() {
    super("ConversationArchiveDB");
    this.version(1).stores({
      snapshots: "++id, conversationId, capturedAt",
    });
  }
}

const db = new ArchiveDB();

/** Save a conversation snapshot */
export async function saveSnapshot(
  snapshot: Omit<ConversationSnapshot, "id">
): Promise<number> {
  return db.snapshots.add(snapshot as ConversationSnapshot);
}

/** Get all snapshots for a conversation, newest first */
export async function getSnapshots(
  conversationId: string
): Promise<ConversationSnapshot[]> {
  return db.snapshots
    .where("conversationId")
    .equals(conversationId)
    .reverse()
    .sortBy("capturedAt");
}

/** Get all snapshots across all conversations, newest first */
export async function getAllSnapshots(): Promise<ConversationSnapshot[]> {
  return db.snapshots.orderBy("capturedAt").reverse().toArray();
}

/** Delete all snapshots for a conversation */
export async function deleteSnapshots(conversationId: string): Promise<void> {
  await db.snapshots.where("conversationId").equals(conversationId).delete();
}

/** Delete a single snapshot by id */
export async function deleteSnapshot(id: number): Promise<void> {
  await db.snapshots.delete(id);
}

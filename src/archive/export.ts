import type { ConversationSnapshot } from "@shared/types";

/** Export a snapshot as a JSON file download */
export function exportAsJSON(snapshot: ConversationSnapshot): void {
  const data = JSON.stringify(snapshot, null, 2);
  download(data, `chat-${snapshot.conversationId.slice(0, 8)}-${snapshot.capturedAt}.json`, "application/json");
}

/** Export a snapshot as a Markdown file download */
export function exportAsMarkdown(snapshot: ConversationSnapshot): void {
  const lines: string[] = [
    `# ${snapshot.title}`,
    "",
    `> Captured: ${new Date(snapshot.capturedAt).toLocaleString()}`,
    `> Conversation ID: ${snapshot.conversationId}`,
    "",
    "---",
    "",
  ];

  for (const msg of snapshot.messages) {
    const label = msg.role === "user" ? "**User**" : "**Assistant**";
    lines.push(`### ${label}`, "", msg.content, "", "---", "");
  }

  download(lines.join("\n"), `chat-${snapshot.conversationId.slice(0, 8)}-${snapshot.capturedAt}.md`, "text/markdown");
}

function download(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

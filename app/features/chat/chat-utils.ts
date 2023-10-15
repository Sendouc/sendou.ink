import type { ChatMessage } from "./chat-types";

export function messageTypeToSound(type: ChatMessage["type"]) {
  if (type === "LIKE_RECEIVED") return "sq_like";
  if (type === "MATCH_STARTED") return "sq_match";
  if (type === "NEW_GROUP") return "sq_new-group";

  return null;
}

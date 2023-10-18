import type { ChatMessage } from "./chat-types";

export function messageTypeToSound(type: ChatMessage["type"]) {
  if (type === "LIKE_RECEIVED") return "sq_like";
  if (type === "MATCH_STARTED") return "sq_match";
  if (type === "NEW_GROUP") return "sq_new-group";

  return null;
}

export function soundCodeToLocalStorageKey(soundCode: string) {
  return `settings__sound-enabled__${soundCode}`;
}

export function soundEnabled(soundCode: string) {
  const localStorageKey = soundCodeToLocalStorageKey(soundCode);
  const soundEnabled = localStorage.getItem(localStorageKey);

  return !soundEnabled || soundEnabled === "true";
}

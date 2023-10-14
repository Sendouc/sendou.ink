import { nanoid } from "nanoid";
import invariant from "tiny-invariant";
import type { ChatMessage } from "~/components/Chat";
import { SKALOP_TOKEN_HEADER_NAME } from "~/constants";

interface SQNotificationService {
  notify: (
    msg: Pick<ChatMessage, "type" | "context" | "room" | "revalidateOnly">,
  ) => undefined;
}

invariant(
  process.env["SKALOP_SYSTEM_MESSAGE_URL"],
  "Missing env var: SKALOP_SYSTEM_MESSAGE_URL",
);
invariant(process.env["SKALOP_TOKEN"], "Missing env var: SKALOP_TOKEN");

// xxx: should be common Notification service
export const notify: SQNotificationService["notify"] = (partialMsg) => {
  const msg: ChatMessage = {
    id: nanoid(),
    timestamp: Date.now(),
    room: partialMsg.room,
    context: partialMsg.context,
    type: partialMsg.type,
    revalidateOnly: partialMsg.revalidateOnly,
  };

  return void fetch(process.env["SKALOP_SYSTEM_MESSAGE_URL"]!, {
    method: "POST",
    body: JSON.stringify(msg),
    headers: [[SKALOP_TOKEN_HEADER_NAME, process.env["SKALOP_TOKEN"]!]],
  });
};

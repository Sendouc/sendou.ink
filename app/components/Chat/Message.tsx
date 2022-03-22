import clsx from "clsx";
import { ChatLoaderData } from "~/routes/chat";
import { Unpacked } from "~/utils";

export function Message({
  data,
  sending,
  user,
}: {
  data: Omit<Unpacked<ChatLoaderData["messages"]>, "roomId" | "id">;
  sending?: boolean;
  user: { info?: string; name: string };
}) {
  return (
    <li className="chat__message">
      <div className="chat__message__message-header">
        <div className="chat__message__sender">{user.name}</div>
        {user.info && (
          <div className="chat__message__extra-info">{user.info}</div>
        )}
      </div>

      <div className={clsx("chat__message__content", { sending })}>
        <time className="chat__message__time mr-2">
          {new Date(data.createdAtTimestamp).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
          })}
        </time>
        {data.content}
      </div>
    </li>
  );
}

import { Avatar } from "./Avatar";
import * as React from "react";
import { SubmitButton } from "./SubmitButton";
import type { User } from "~/db/types";
import { useUser } from "~/modules/auth";
import { nanoid } from "nanoid";
import clsx from "clsx";

// xxx: patron color
type ChatUser = Pick<User, "discordName" | "discordId" | "discordAvatar">;

interface ChatProps {
  users: Record<number, ChatUser>;
}

export function Chat({ users }: ChatProps) {
  const messagesContainerRef = React.useRef<HTMLOListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { send, messages } = useChat();

  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      send(inputRef.current!.value);
      inputRef.current!.value = "";
    },
    [send],
  );

  React.useEffect(() => {
    const messagesContainer = messagesContainerRef.current!;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, [messages]);

  return (
    <section className="chat__container">
      <div className="chat__input-container">
        <ol className="chat__messages" ref={messagesContainerRef}>
          {messages.map((msg) => {
            return (
              <Message
                key={msg.id}
                user={
                  users[msg.userId] ?? {
                    discordId: "-1",
                    discordName: String(msg.userId),
                  }
                }
                message={msg}
              />
            );
          })}
        </ol>
        <form onSubmit={handleSubmit} className="mt-4">
          <input className="w-full" ref={inputRef} />{" "}
          <SubmitButton>Send</SubmitButton>
        </form>
      </div>
    </section>
  );
}

function Message({ user, message }: { user: ChatUser; message: ChatMessage }) {
  return (
    <li className="chat__message">
      <Avatar user={user} size="xs" />
      <div>
        <div className="stack horizontal sm">
          <div className="chat__message__user">{user.discordName}</div>
          {!message.pending ? (
            <time className="chat__message__time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </time>
          ) : null}
        </div>
        <div
          className={clsx("chat__message__contents", {
            pending: message.pending,
          })}
        >
          {message.contents}
        </div>
      </div>
    </li>
  );
}

interface ChatMessage {
  id: string;
  type: "message" | "system";
  contents: string;
  userId: number;
  timestamp: number;
  pending?: boolean;
}

// xxx: TODO: load initial messages
function useChat() {
  const user = useUser();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [sentMessage, setSentMessage] = React.useState<ChatMessage>();
  const ws = React.useRef<WebSocket>();
  React.useEffect(() => {
    // xxx: pass from env vars
    ws.current = new WebSocket("ws://localhost:5900");
    ws.current.onopen = () => console.log("ws opened");
    ws.current.onclose = () => console.log("ws closed");

    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      setMessages((messages) => [...messages, message]);
    };

    const wsCurrent = ws.current;
    return () => {
      wsCurrent.close();
    };
  }, []);

  const send = React.useCallback(
    (contents: string) => {
      const id = nanoid();
      setSentMessage({
        id,
        type: "message",
        contents,
        timestamp: Date.now(),
        userId: user!.id,
      });
      ws.current!.send(JSON.stringify({ id, contents }));
    },
    [user],
  );

  let allMessages = messages;
  if (sentMessage && !messages.some((msg) => msg.id === sentMessage.id)) {
    allMessages = [...messages, { ...sentMessage, pending: true }];
  }

  return { messages: allMessages, send };
}

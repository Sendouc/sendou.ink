import { Avatar } from "./Avatar";
import * as React from "react";
import { SubmitButton } from "./SubmitButton";
import type { User } from "~/db/types";

// xxx: patron color
type ChatUser = Pick<User, "discordName" | "discordId" | "discordAvatar">;

interface ChatProps {
  users: Record<number, ChatUser>;
}

export function Chat({ users }: ChatProps) {
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

  return (
    <section className="chat__container">
      <div className="chat__input-container">
        <ol className="chat__messages">
          {messages.map((msg, i) => {
            return (
              <Message
                key={i}
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
        <form onSubmit={handleSubmit}>
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
          <time className="chat__message__time">
            {new Date(message.timestamp).toLocaleTimeString()}
          </time>
        </div>
        <div className="chat__message__contents">{message.contents}</div>
      </div>
    </li>
  );
}

interface ChatMessage {
  type: "message" | "system";
  contents: string;
  userId: number;
  timestamp: number;
}

// xxx: TODO: load initial messages
function useChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
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

  const send = React.useCallback((message: string) => {
    ws.current!.send(message);
  }, []);

  return { messages, send };
}

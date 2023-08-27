import { useUser } from "~/modules/auth";
import { Avatar } from "./Avatar";
import * as React from "react";
import { SubmitButton } from "./SubmitButton";

export function Chat() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { send } = useChat();

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
          <Message />
        </ol>
        <form onSubmit={handleSubmit}>
          <input className="w-full" ref={inputRef} />{" "}
          <SubmitButton>Send</SubmitButton>
        </form>
      </div>
    </section>
  );
}

function Message() {
  // xxx: pass user as argument
  const user = useUser();

  return (
    <li className="chat__message">
      <Avatar user={user} size="xs" />
      <div>
        <div className="stack horizontal sm">
          <div className="chat__message__user">{user!.discordName}</div>
          <time className="chat__message__time">17:31</time>
        </div>
        <div className="chat__message__contents">
          Join the room now or else idk what will happen
        </div>
      </div>
    </li>
  );
}

function useChat() {
  const ws = React.useRef<WebSocket>();
  React.useEffect(() => {
    ws.current = new WebSocket("ws://localhost:5900");
    ws.current.onopen = () => console.log("ws opened");
    ws.current.onclose = () => console.log("ws closed");

    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      console.log("e", message);
    };

    const wsCurrent = ws.current;
    return () => {
      wsCurrent.close();
    };
  }, []);

  const send = React.useCallback((message: string) => {
    ws.current!.send(message);
  }, []);

  return { send };
}

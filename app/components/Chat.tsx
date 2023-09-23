import { Avatar } from "./Avatar";
import * as React from "react";
import { SubmitButton } from "./SubmitButton";
import type { User } from "~/db/types";
import { useUser } from "~/modules/auth";
import { nanoid } from "nanoid";
import clsx from "clsx";
import { SKALOP_BASE_URL } from "~/utils/urls";
import { Button } from "./Button";
import ReconnectingWebSocket from "reconnecting-websocket";

type ChatUser = Pick<User, "discordName" | "discordId" | "discordAvatar"> & {
  chatNameColor: string | null;
};

const MESSAGE_MAX_LENGTH = 200;

export interface ChatProps {
  users: Record<number, ChatUser>;
  rooms: { label: string; code: string }[];
  className?: string;
  messagesContainerClassName?: string;
  hidden?: boolean;
  onNewMessage?: (message: ChatMessage) => void;
}

export function Chat({
  users,
  rooms,
  className,
  messagesContainerClassName,
  hidden = false,
  onNewMessage,
}: ChatProps) {
  const messagesContainerRef = React.useRef<HTMLOListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const {
    send,
    messages,
    currentRoom,
    setCurrentRoom,
    connected,
    unseenMessages,
  } = useChat({ rooms, onNewMessage });

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
    <section className={clsx("chat__container", className, { hidden })}>
      {rooms.length > 1 ? (
        <div className="stack horizontal">
          {rooms.map((room, i) => {
            const unseen = unseenMessages.get(room.code);

            return (
              <Button
                key={room.code}
                className={clsx("chat__room-button", {
                  "not-first": i > 0,
                  current: currentRoom === room.code,
                })}
                onClick={() => setCurrentRoom(room.code)}
              >
                <span className="chat__room-button__unseen invisible" />
                {room.label}
                {unseen ? (
                  <span className="chat__room-button__unseen">{unseen}</span>
                ) : (
                  <span className="chat__room-button__unseen invisible" />
                )}
              </Button>
            );
          })}
        </div>
      ) : null}
      <div className="chat__input-container">
        <ol
          className={clsx("chat__messages", messagesContainerClassName)}
          ref={messagesContainerRef}
        >
          {messages.map((msg) => {
            const user = msg.userId ? users[msg.userId] : null;
            if (!user) return null;

            return <Message key={msg.id} user={user} message={msg} />;
          })}
        </ol>
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            className="w-full"
            ref={inputRef}
            placeholder="Press enter to send"
            disabled={!connected}
            maxLength={MESSAGE_MAX_LENGTH}
          />{" "}
          <div className="chat__bottom-row">
            {typeof connected !== "boolean" ? (
              <div />
            ) : connected ? (
              <div className="text-xxs font-semi-bold text-lighter">
                Connected
              </div>
            ) : (
              <div className="text-xxs font-semi-bold text-warning">
                Disconnected
              </div>
            )}
            <SubmitButton size="tiny" variant="minimal" disabled={!connected}>
              Send
            </SubmitButton>
          </div>
        </form>
      </div>
    </section>
  );
}

function Message({ user, message }: { user: ChatUser; message: ChatMessage }) {
  return (
    <li className="chat__message">
      <Avatar user={user} size="xs" className="my-auto" />
      <div>
        <div className="stack horizontal sm">
          <div
            className="chat__message__user"
            style={
              user.chatNameColor
                ? ({ "--chat-user-color": user.chatNameColor } as any)
                : undefined
            }
          >
            {user.discordName}
          </div>
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

// export type SystemMessageType = "MANAGER_ADDED" | "MANAGER_REMOVED";
export interface ChatMessage {
  id: string;
  // type?: SystemMessageType;
  contents?: string;
  // context?: any;
  userId?: number;
  timestamp: number;
  room: string;
  pending?: boolean;
}

function useChat({
  rooms,
  onNewMessage,
}: {
  rooms: ChatProps["rooms"];
  onNewMessage?: (message: ChatMessage) => void;
}) {
  const user = useUser();

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [connected, setConnected] = React.useState<null | boolean>(null);
  const [sentMessage, setSentMessage] = React.useState<ChatMessage>();
  const [currentRoom, setCurrentRoom] = React.useState<string>(rooms[0].code);

  const ws = React.useRef<ReconnectingWebSocket>();
  const lastSeenMessagesByRoomId = React.useRef<Map<string, string>>(new Map());

  React.useEffect(() => {
    const url = `${SKALOP_BASE_URL}?${rooms
      .map((room) => `room=${room.code}`)
      .join("&")}`;
    ws.current = new ReconnectingWebSocket(url, [], {
      maxReconnectionDelay: 10000 * 2,
      reconnectionDelayGrowFactor: 1.5,
    });
    ws.current.onopen = () => {
      setCurrentRoom(rooms[0].code);
      setConnected(true);
    };
    ws.current.onclose = () => setConnected(false);

    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      const messageArr = Array.isArray(message) ? message : [message];

      const isInitialLoad = Array.isArray(message);

      if (isInitialLoad) {
        lastSeenMessagesByRoomId.current = message.reduce((acc, cur) => {
          acc.set(cur.room, cur.id);
          return acc;
        }, new Map<string, string>());
      }

      if (isInitialLoad) {
        setMessages(messageArr);
      } else {
        onNewMessage?.(message);
        setMessages((messages) => [...messages, ...messageArr]);
      }
    };

    const wsCurrent = ws.current;
    return () => {
      wsCurrent.close();
      setMessages([]);
    };
  }, [rooms, onNewMessage]);

  const send = React.useCallback(
    (contents: string) => {
      const id = nanoid();
      setSentMessage({
        id,
        room: currentRoom,
        contents,
        timestamp: Date.now(),
        userId: user!.id,
      });
      ws.current!.send(JSON.stringify({ id, contents, room: currentRoom }));
    },
    [user, currentRoom],
  );

  let allMessages = messages;
  if (sentMessage && !messages.some((msg) => msg.id === sentMessage.id)) {
    allMessages = [...messages, { ...sentMessage, pending: true }];
  }

  const roomsMessages = allMessages
    .filter((msg) => msg.room === currentRoom)
    .sort((a, b) => a.timestamp - b.timestamp);
  if (roomsMessages.length > 0) {
    lastSeenMessagesByRoomId.current.set(
      currentRoom,
      roomsMessages[roomsMessages.length - 1].id,
    );
  }

  const unseenMessages = unseenMessagesCountByRoomId({
    messages,
    lastSeenMessages: lastSeenMessagesByRoomId.current,
  });

  return {
    messages: roomsMessages,
    send,
    currentRoom,
    setCurrentRoom,
    connected,
    unseenMessages,
  };
}

function unseenMessagesCountByRoomId({
  messages,
  lastSeenMessages,
}: {
  messages: ChatMessage[];
  lastSeenMessages: Map<string, string>;
}) {
  const lastUnseenEncountered = new Set<string>();

  const unseenMessages = messages.filter((msg) => {
    if (msg.id === lastSeenMessages.get(msg.room)) {
      lastUnseenEncountered.add(msg.room);
      return false;
    }

    return lastUnseenEncountered.has(msg.room);
  });

  return unseenMessages.reduce((acc, cur) => {
    const count = acc.get(cur.room) ?? 0;
    acc.set(cur.room, count + 1);
    return acc;
  }, new Map<string, number>());
}

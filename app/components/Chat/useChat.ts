import * as React from "react";
import { useFetcher } from "remix";
import invariant from "tiny-invariant";
import { useUser } from "~/hooks/common";
import { useSocketEvent } from "~/hooks/useSocketEvent";
import { ChatActionData, ChatLoaderData } from "~/routes/chat";
import { Unpacked } from "~/utils";
import { chatRoute } from "~/utils/urls";

export default function useChat(id: string) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messagesAfterLoad, setMessagesAfterLoad] = React.useState<
    ChatLoaderData["messages"]
  >([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const loaderFetcher = useFetcher<ChatLoaderData>();
  const actionFetcher = useFetcher<ChatActionData>();
  const containerRef = React.useRef<HTMLUListElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const user = useUser();
  invariant(user, "!user");

  const eventHandler = React.useCallback(
    (data: Unpacked<ChatLoaderData["messages"]>) => {
      if (data.sender.id === user.id) return;
      setMessagesAfterLoad((messages) => [...messages, data]);
      if (!isOpen) {
        setUnreadCount((count) => count + 1);
      }
    },
    [isOpen, user.id]
  );

  useSocketEvent(`chat-${id}`, eventHandler);

  React.useEffect(() => {
    loaderFetcher.load(chatRoute([id]));
  }, [id]);

  // open chat on data load if there are messages
  React.useEffect(() => {
    if (!loaderFetcher.data) return;

    if (loaderFetcher.data.messages.length > 0) {
      setIsOpen(true);
    }
  }, [loaderFetcher.data]);

  // after sending message reset and refocus input so user can keep typing
  React.useEffect(() => {
    if (actionFetcher.submission) {
      formRef.current?.reset();
      inputRef.current?.focus();
    }
  }, [actionFetcher.submission]);

  React.useEffect(() => {
    if (!actionFetcher.data) return;

    setMessagesAfterLoad((messagesAfterLoad) => {
      if (!actionFetcher.data) return [...messagesAfterLoad];
      return [...messagesAfterLoad, actionFetcher.data.createdMessage];
    });
  }, [actionFetcher.data]);

  const messages = React.useMemo(
    () =>
      loaderFetcher.data
        ? [...loaderFetcher.data.messages, ...messagesAfterLoad].sort(
            (a, b) => a.createdAtTimestamp - b.createdAtTimestamp
          )
        : undefined,
    [loaderFetcher.data, messagesAfterLoad]
  );

  const sentMessage = React.useMemo(() => {
    const newMessageContent = actionFetcher.submission?.formData.get("message");
    if (
      typeof newMessageContent !== "string" ||
      actionFetcher.state !== "submitting"
    ) {
      return;
    }

    return newMessageContent;
  }, [actionFetcher]);

  const toggleOpen = React.useCallback(() => {
    setIsOpen((open) => {
      if (!open) {
        setUnreadCount(0);
        return true;
      }

      return false;
    });
  }, []);

  React.useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages, sentMessage, isOpen]);

  return {
    messages,
    sentMessage,
    containerRef,
    formRef,
    inputRef,
    actionFetcher,
    isOpen,
    toggleOpen,
    unreadCount,
  };
}

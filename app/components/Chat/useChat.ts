import * as React from "react";
import { useFetcher } from "remix";
import invariant from "tiny-invariant";
import { useEvents, useUser } from "~/hooks/common";
import { ChatActionData, ChatLoaderData } from "~/routes/chat";
import { Unpacked } from "~/utils";
import { chatRoute } from "~/utils/urls";

export default function useChat(id: string) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messagesAfterLoad, setMessagesAfterLoad] = React.useState<
    ChatLoaderData["messages"]
  >([]);
  const loaderFetcher = useFetcher<ChatLoaderData>();
  const actionFetcher = useFetcher<ChatActionData>();
  const containerRef = React.useRef<HTMLUListElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const user = useUser();
  invariant(user, "!user");

  useEvents({ type: "chat", roomId: id, userId: user.id }, (data: unknown) => {
    setMessagesAfterLoad((messages) => [
      ...messages,
      data as Unpacked<ChatLoaderData["messages"]>,
    ]);
    setIsOpen(true);
  });

  React.useEffect(() => {
    loaderFetcher.load(chatRoute([id]));
  }, []);

  React.useEffect(() => {
    if (actionFetcher.submission) {
      formRef.current?.reset();
      inputRef.current?.focus();
    }
  }, [actionFetcher.submission]);

  React.useEffect(() => {
    if (!actionFetcher.data) return;

    setMessagesAfterLoad([
      ...messagesAfterLoad,
      actionFetcher.data.createdMessage,
    ]);
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
    setIsOpen,
  };
}

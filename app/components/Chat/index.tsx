import { MAX_CHAT_MESSAGE_LENGTH } from "~/constants";
import { useUser } from "~/hooks/common";
import { chatRoute } from "~/utils/urls";
import { Button } from "../Button";
import { CrossIcon } from "../icons/Cross";
import { SpeechBubbleIcon } from "../icons/SpeechBubble";
import { Message } from "./Message";
import useChat from "./useChat";

export function Chat({
  id,
  userInfos,
}: {
  id: string;
  userInfos: { [id: string]: string };
}) {
  const user = useUser();
  const {
    messages,
    sentMessage,
    containerRef,
    formRef,
    inputRef,
    actionFetcher,
    isOpen,
    setIsOpen,
  } = useChat(id);

  if (!user) return null;

  return (
    <>
      {isOpen && (
        <div className="chat__window">
          <ul className="chat__messages" ref={containerRef}>
            {messages?.map((message) => (
              <Message
                key={message.id}
                data={message}
                userInfo={userInfos[message.sender.id]}
              />
            ))}
            {sentMessage && (
              <Message
                data={{
                  createdAtTimestamp: new Date().getTime(),
                  content: sentMessage,
                  sender: {
                    id: user.id,
                    // TODO:
                    discordName: user.discordName!,
                  },
                }}
                userInfo={userInfos[user.id]}
                sending
              />
            )}
          </ul>
          <actionFetcher.Form
            className="chat__input-container"
            ref={formRef}
            method="post"
            action={chatRoute()}
          >
            <input type="hidden" name="roomId" value={id} />
            <input
              ref={inputRef}
              className="chat__message__input"
              name="message"
              maxLength={MAX_CHAT_MESSAGE_LENGTH}
              required
            />
            <Button tiny variant="outlined" type="submit">
              Send
            </Button>
          </actionFetcher.Form>
        </div>
      )}
      <button className="chat__fab" onClick={() => setIsOpen(() => !isOpen)}>
        {isOpen ? (
          <CrossIcon className="chat__fab__icon" />
        ) : (
          <SpeechBubbleIcon className="chat__fab__icon" />
        )}
      </button>
    </>
  );
}

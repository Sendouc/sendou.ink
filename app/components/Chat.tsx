import { useUser } from "~/modules/auth";
import { Button } from "./Button";
import { Avatar } from "./Avatar";

export function Chat() {
  return (
    <section className="chat__container">
      <div className="chat__input-container">
        <ol className="chat__messages">
          <Message />
        </ol>
        <input className="w-full" /> <Button>Send</Button>
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

import { Show } from "solid-js";
import { DiscordIcon } from "../../../components/icons/Discord";
import { useUser } from "../../../utils/UserContext";
import s from "../styles/UserItem.module.css";

// TODO: redirect to same page on login
export function UserItem() {
  const user = useUser();

  return (
    <Show
      when={user()}
      fallback={
        !user.loading && (
          <form
            action={`${import.meta.env.VITE_BACKEND_URL}/auth/discord`}
            method="post"
          >
            <button type="submit" class={s.logInButton}>
              <DiscordIcon /> Log in
            </button>
          </form>
        )
      }
    >
      {(user) => (
        <img
          class={s.avatar}
          src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png?size=80`}
        />
      )}
    </Show>
  );
}

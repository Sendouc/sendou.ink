import { createResource, Show } from "solid-js";
import { DiscordIcon } from "../../../components/icons/Discord";
import { trpcClient } from "../../../utils/trpc-client";
import s from "../styles/UserItem.module.css";

const fetchLoggedInUser = async () => {
  return trpcClient.query("layout.getLoggedInUser");
};

export function UserItem() {
  const [user] = createResource(fetchLoggedInUser);

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

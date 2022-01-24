import { useLocation } from "remix";
import { getLogInUrl } from "~/utils";
import { useUser } from "~/hooks/common";
import { DiscordIcon } from "../icons/Discord";

export function UserItem() {
  const user = useUser();
  const location = useLocation();

  if (user && user.discordAvatar)
    return (
      <img
        className="layout__avatar"
        src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png?size=80`}
      />
    );

  // TODO: just show text... my profile?
  // TODO: also show this if discordAvatar is stale and 404's
  if (user) {
    return <div className="layout__header__logo-container" />;
  }

  return (
    <form action={getLogInUrl(location)} method="post" data-cy="log-in-form">
      <button
        type="submit"
        className="layout__log-in-button"
        data-cy="log-in-button"
      >
        <DiscordIcon /> Log in
      </button>
    </form>
  );
}

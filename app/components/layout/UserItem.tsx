import { Link } from "@remix-run/react";
import { useUser } from "~/hooks/useUser";
import { LOG_IN_URL, LOG_OUT_URL, userPage } from "~/utils/urls";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { DiscordIcon } from "../icons/Discord";
import { LogOutIcon } from "../icons/LogOut";
import { UserIcon } from "../icons/User";
import { Popover } from "../Popover";

export function UserItem() {
  const user = useUser();

  if (user && user.discordAvatar)
    return (
      <Popover trigger={<Avatar {...user} />}>
        <div className="layout__user-popover">
          {/* TODO: make the Button component transformable to Link instead of creating a wrapper */}
          <Link to={userPage(user.discordId)}>
            <Button
              className="w-full"
              tiny
              variant="outlined"
              icon={<UserIcon />}
            >
              Profile
            </Button>
          </Link>
          <form method="post" action={LOG_OUT_URL}>
            <Button tiny variant="outlined" icon={<LogOutIcon />} type="submit">
              Log out
            </Button>
          </form>
        </div>
      </Popover>
    );

  return (
    <form action={LOG_IN_URL} method="post" data-cy="log-in-form">
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

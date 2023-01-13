import { Link } from "@remix-run/react";
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/modules/auth";
import { userPage } from "~/utils/urls";
import { Avatar } from "../Avatar";
import { LogInIcon } from "../icons/LogIn";
import { LogInButtonContainer } from "./LogInButtonContainer";

export function UserItem() {
  const { t } = useTranslation();
  const user = useUser();

  if (user) {
    return (
      <Link to={userPage(user)} prefetch="intent">
        <Avatar
          user={user}
          alt={t("header.loggedInAs", {
            userName: `${user.discordName}`,
          })}
          className="layout__avatar"
          size="sm"
        />
      </Link>
    );
  }

  return (
    <LogInButtonContainer>
      <button type="submit" className="layout__log-in-button">
        <LogInIcon /> {t("header.login")}
      </button>
    </LogInButtonContainer>
  );
}

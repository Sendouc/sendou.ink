import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useUser } from "~/features/auth/core/user";
import { userPage } from "~/utils/urls";
import { Avatar } from "../Avatar";
import { LogInIcon } from "../icons/LogIn";
import { LogInButtonContainer } from "./LogInButtonContainer";
import { useRootLoaderData } from "~/hooks/useRootLoaderData";

export function UserItem() {
  const data = useRootLoaderData();
  const { t } = useTranslation();
  const user = useUser();

  if (user) {
    return (
      <Link to={userPage(user)} prefetch="intent">
        <Avatar
          user={user}
          alt={t("header.loggedInAs", {
            userName: `${user.username}`,
          })}
          className="layout__avatar"
          size="sm"
        />
      </Link>
    );
  }

  if (data.loginDisabled) {
    return false;
  }

  return (
    <LogInButtonContainer>
      <button type="submit" className="layout__log-in-button">
        <LogInIcon /> {t("header.login")}
      </button>
    </LogInButtonContainer>
  );
}

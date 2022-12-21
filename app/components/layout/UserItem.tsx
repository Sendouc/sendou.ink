import { Link } from "@remix-run/react";
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/modules/auth";
import { LOG_OUT_URL, userPage } from "~/utils/urls";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { LogInIcon } from "../icons/LogIn";
import { LogOutIcon } from "../icons/LogOut";
import { UserIcon } from "../icons/User";
import { Popover } from "../Popover";
import { LogInButtonContainer } from "./LogInButtonContainer";

export function UserItem() {
  const { t } = useTranslation();
  const user = useUser();

  if (user) {
    return (
      <Popover
        buttonChildren={
          <Avatar
            user={user}
            alt={t("header.loggedInAs", {
              userName: `${user.discordName}`,
            })}
            className="layout__avatar"
            size="sm"
          />
        }
      >
        <div className="layout__user-popover">
          <Link to={userPage(user)}>
            <Button
              className="w-full"
              size="tiny"
              variant="outlined"
              icon={<UserIcon />}
            >
              {t("pages.myPage")}
            </Button>
          </Link>
          <form method="post" action={LOG_OUT_URL}>
            <Button
              size="tiny"
              variant="outlined"
              icon={<LogOutIcon />}
              type="submit"
              className="w-full"
            >
              {t("header.logout")}
            </Button>
          </form>
        </div>
      </Popover>
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

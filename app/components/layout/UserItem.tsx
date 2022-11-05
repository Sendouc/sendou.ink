import { Link, useSearchParams } from "@remix-run/react";
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/modules/auth";
import { LOG_IN_URL, LOG_OUT_URL, userPage } from "~/utils/urls";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { Dialog } from "../Dialog";
import { DiscordIcon } from "../icons/Discord";
import { LogOutIcon } from "../icons/LogOut";
import { UserIcon } from "../icons/User";
import { Popover } from "../Popover";

export function UserItem() {
  const { t } = useTranslation();
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

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
              tiny
              variant="outlined"
              icon={<UserIcon />}
            >
              {t("header.profile")}
            </Button>
          </Link>
          <form method="post" action={LOG_OUT_URL}>
            <Button tiny variant="outlined" icon={<LogOutIcon />} type="submit">
              {t("header.logout")}
            </Button>
          </form>
        </div>
      </Popover>
    );
  }

  const authError = searchParams.get("authError");
  const closeAuthErrorDialog = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("authError");
    setSearchParams(newSearchParams);
  };

  return (
    <>
      <form action={LOG_IN_URL} method="post">
        <button type="submit" className="layout__log-in-button">
          <DiscordIcon /> {t("header.login")}
        </button>
      </form>
      {authError != null && (
        <Dialog isOpen close={closeAuthErrorDialog}>
          <div className="stack md">
            <AuthenticationErrorHelp errorCode={authError} />
            <Button onClick={closeAuthErrorDialog}>{t("actions.close")}</Button>
          </div>
        </Dialog>
      )}
    </>
  );
}

function AuthenticationErrorHelp({ errorCode }: { errorCode: string }) {
  const { t } = useTranslation();

  switch (errorCode) {
    case "aborted":
      return (
        <>
          <h2 className="text-lg text-center">{t("auth.errors.aborted")}</h2>
          {t("auth.errors.discordPermissions")}
        </>
      );
    case "unknown":
    default:
      return (
        <>
          <h2 className="text-lg text-center">{t("auth.errors.failed")}</h2>
          {t("auth.errors.unknown")}
        </>
      );
  }
}

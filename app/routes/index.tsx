import { Main } from "~/components/Main";
import navItems from "~/components/layout/nav-items.json";
import { Image } from "~/components/Image";
import { LOG_OUT_URL, navIconUrl, userPage } from "~/utils/urls";
import { useTranslation } from "~/hooks/useTranslation";
import type { LinksFunction } from "@remix-run/node";
import styles from "~/styles/front.css";
import { Link } from "@remix-run/react";
import { GlobeIcon } from "~/components/icons/Globe";
import { LanguageChanger } from "~/components/layout/LanguageChanger";
import { Avatar } from "~/components/Avatar";
import { useUser } from "~/modules/auth";
import { languages } from "~/modules/i18n";
import { Button } from "~/components/Button";
import { LogOutIcon } from "~/components/icons/LogOut";
import { LogInButtonContainer } from "~/components/layout/LogInButtonContainer";
import { LogInIcon } from "~/components/icons/LogIn";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function FrontPage() {
  const { t, i18n } = useTranslation(["common"]);
  const user = useUser();

  const selectedLanguage = languages.find(
    (lang) => i18n.language === lang.code
  );

  // xxx: add borzoic drawing
  // xxx: test in other languages (ellipsis)
  return (
    <Main className="stack lg">
      <div className="front__nav-items-container">
        <div className="front__nav-item round">
          <LanguageChanger plain>
            <div className="front__nav-image-container round">
              <GlobeIcon size={28} alt={t("common:header.language")} />
            </div>
          </LanguageChanger>
          {selectedLanguage?.name ?? ""}
        </div>

        <div className="front__nav-item round" />

        {user ? (
          <Link to={userPage(user)} className="front__nav-item round">
            <Avatar
              user={user}
              alt={t("common:header.loggedInAs", {
                userName: `${user.discordName}`,
              })}
              className="front__avatar"
              size="sm"
            />
            {t("common:pages.myPage")}
          </Link>
        ) : (
          <div className="front__nav-item round">
            <LogInButtonContainer>
              <button className="front__log-in-button">
                <LogInIcon size={28} />
              </button>
            </LogInButtonContainer>
            {t("common:header.login")}
          </div>
        )}

        {navItems.map((item) => (
          <Link
            to={item.url}
            className="front__nav-item"
            key={item.name}
            prefetch={item.prefetch ? "render" : undefined}
          >
            <div className="front__nav-image-container">
              <Image
                path={navIconUrl(item.name)}
                height={48}
                width={48}
                alt=""
              />
            </div>
            <div>{t(`common:pages.${item.name}` as any)}</div>
          </Link>
        ))}
      </div>
      {user ? (
        <div className="front__log-out-container">
          <form method="post" action={LOG_OUT_URL}>
            <Button
              tiny
              variant="outlined"
              icon={<LogOutIcon />}
              type="submit"
              className="w-full"
            >
              {t("common:header.logout")}
            </Button>
          </form>
        </div>
      ) : null}
    </Main>
  );
}

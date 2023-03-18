import { Main } from "~/components/Main";
import navItems from "~/components/layout/nav-items.json";
import { Image } from "~/components/Image";
import {
  FRONT_BOY_BG_PATH,
  FRONT_BOY_PATH,
  FRONT_GIRL_BG_PATH,
  FRONT_GIRL_PATH,
  LOG_OUT_URL,
  navIconUrl,
  userPage,
} from "~/utils/urls";
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
import * as React from "react";
import { ThemeChanger } from "~/components/layout/ThemeChanger";
import { SelectedThemeIcon } from "~/components/layout/SelectedThemeIcon";
import { useTheme } from "~/modules/theme";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function FrontPage() {
  const { userTheme } = useTheme();
  const [filters, setFilters] = React.useState<[string, string]>(
    navItems[0]?.filters as [string, string]
  );
  const { t, i18n } = useTranslation(["common"]);
  const user = useUser();

  const selectedLanguage = languages.find(
    (lang) => i18n.language === lang.code
  );

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

        <div className="front__nav-item round">
          <ThemeChanger plain>
            <div className="front__nav-image-container round">
              <SelectedThemeIcon size={28} />
            </div>
          </ThemeChanger>
          {t(`common:theme.${userTheme ?? "auto"}`)}
        </div>

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
            onMouseEnter={() => setFilters(item.filters as [string, string])}
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
              size="tiny"
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
      <Drawings filters={filters} />
    </Main>
  );
}

function Drawings({
  filters,
}: {
  filters: [boyFilter: string, girlFilter: string];
}) {
  return (
    <div className="front__drawings">
      <Image
        path={FRONT_BOY_PATH}
        className="front__drawing-img"
        containerClassName="front__drawings__boy"
        alt=""
      />
      <Image
        path={FRONT_BOY_BG_PATH}
        className="front__drawing-img"
        containerClassName="front__drawings__boy bg"
        style={{ filter: filters[0] }}
        alt=""
      />
      <Image
        path={FRONT_GIRL_PATH}
        className="front__drawing-img"
        containerClassName="front__drawings__girl"
        alt=""
      />
      <Image
        path={FRONT_GIRL_BG_PATH}
        className="front__drawing-img"
        containerClassName="front__drawings__girl bg"
        style={{ filter: filters[1] }}
        alt=""
      />
    </div>
  );
}

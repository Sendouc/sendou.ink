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
  tournamentPage,
  userPage,
} from "~/utils/urls";
import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";
import { GlobeIcon } from "~/components/icons/Globe";
import { LanguageChanger } from "~/components/layout/LanguageChanger";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { LogOutIcon } from "~/components/icons/LogOut";
import { LogInButtonContainer } from "~/components/layout/LogInButtonContainer";
import { LogInIcon } from "~/components/icons/LogIn";
import * as React from "react";
import { ThemeChanger } from "~/components/layout/ThemeChanger";
import { SelectedThemeIcon } from "~/components/layout/SelectedThemeIcon";
import { useRootLoaderData } from "~/hooks/useRootLoaderData";
import { useTheme } from "~/features/theme/core/provider";
import { useUser } from "~/features/auth/core/user";
import { languages } from "~/modules/i18n/config";
import type { RootLoaderData } from "~/root";

import "~/styles/front.css";
import {
  HACKY_resolvePicture,
  HACKY_resolveThemeColors,
} from "~/features/tournament/tournament-utils";
import { databaseTimestampToDate } from "~/utils/dates";
import { Placement } from "~/components/Placement";
import { useIsMounted } from "~/hooks/useIsMounted";
import clsx from "clsx";

// xxx: support uploaded images
export default function FrontPage() {
  const data = useRootLoaderData();
  const { userTheme } = useTheme();
  const [filters, setFilters] = React.useState<[string, string]>(
    navItems[0]?.filters as [string, string],
  );
  const { t, i18n } = useTranslation(["common"]);
  const user = useUser();

  const selectedLanguage = languages.find(
    (lang) => i18n.language === lang.code,
  );

  return (
    <Main className="stack lg">
      {data.loginDisabled && (
        <div className="text-center text-warning text-xs">
          Log-in is temporarily disabled due to problems with the Discord API
        </div>
      )}
      <div className="stack horizontal sm">
        {data.tournaments.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>
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
        <LogInButton />
        {navItems.map((item) => (
          <Link
            to={`/${item.url}`}
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

function TournamentCard({
  tournament,
}: {
  tournament: RootLoaderData["tournaments"][number];
}) {
  const { t } = useTranslation(["common"]);
  const isMounted = useIsMounted();
  const { i18n } = useTranslation();
  const theme = HACKY_resolveThemeColors(tournament);

  const happeningNow =
    tournament.firstPlacers.length === 0 &&
    databaseTimestampToDate(tournament.startTime) < new Date();

  const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: "auto" });

  const time = () => {
    if (!isMounted) return "Placeholder";
    if (happeningNow) return t("common:showcase.liveNow");

    const date = databaseTimestampToDate(tournament.startTime);
    const dayDifference = Math.floor(
      (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );

    if (tournament.firstPlacers.length > 0)
      return rtf.format(dayDifference, "day");

    return databaseTimestampToDate(tournament.startTime).toLocaleString(
      i18n.language,
      {
        month: "numeric",
        day: "numeric",
        hour: "numeric",
      },
    );
  };

  return (
    <Link
      to={tournamentPage(tournament.id)}
      className="front__tournament-card"
      style={{
        "--card-bg": theme.bg,
        "--card-text": theme.text,
      }}
    >
      <div className="stack horizontal justify-between items-center">
        <Image
          path={HACKY_resolvePicture(tournament)}
          size={24}
          className="rounded-full"
          alt=""
        />
        <div
          className={clsx("front__tournament-card__time", {
            invisible: !isMounted,
          })}
        >
          {time()}
        </div>
      </div>
      <div className="front__tournament-card__name">{tournament.name}</div>
      {tournament.firstPlacers.length > 0 ? (
        <>
          <div />
          <div className="mx-auto stack horizontal sm items-center text-xs">
            <Placement placement={1} size={16} />
            {tournament.firstPlacers[0].teamName}
          </div>
          <ul className="front__tournament-card__first-placers">
            {tournament.firstPlacers.map((p) => (
              <li key={p.id}>{p.discordName}</li>
            ))}
          </ul>
        </>
      ) : (
        <div className="front__tournament-card__register">
          {happeningNow
            ? t("common:showcase.bracket")
            : t("common:showcase.register")}
        </div>
      )}
    </Link>
  );
}

function LogInButton() {
  const data = useRootLoaderData();
  const { t } = useTranslation(["common"]);
  const user = useUser();

  if (user) {
    return (
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
    );
  }

  if (data.loginDisabled) return null;

  return (
    <div className="front__nav-item round">
      <LogInButtonContainer>
        <button className="front__log-in-button">
          <LogInIcon size={28} />
        </button>
      </LogInButtonContainer>
      {t("common:header.login")}
    </div>
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

import { Link, useLoaderData, useLocation } from "remix";
import { DiscordIcon } from "~/components/icons/Discord";
import { TwitterIcon } from "~/components/icons/Twitter";
import { resolveTournamentFormatString } from "~/core/tournament/bracket";
import { tournamentHasStarted } from "~/core/tournament/utils";
import { FindTournamentByNameForUrlI } from "~/services/tournament";
import { getLogInUrl } from "~/utils";
import { useUser } from "~/hooks/common";

export function InfoBanner() {
  const data = useLoaderData<FindTournamentByNameForUrlI>();
  const location = useLocation();

  const urlToTournamentFrontPage = location.pathname
    .split("/")
    .slice(0, 4)
    .join("/");

  return (
    <>
      <div className="info-banner">
        <div className="info-banner__top-row">
          <div className="info-banner__top-row__date-name">
            <time
              dateTime={dateYYYYMMDD(data.startTime)}
              className="info-banner__top-row__month-date"
            >
              <div className="info-banner__top-row__month-date__month">
                {shortMonthName(data.startTime)}
              </div>
              <div className="info-banner__top-row__month-date__date">
                {dayNumber(data.startTime)}
              </div>
            </time>
            <Link
              to={urlToTournamentFrontPage}
              className="info-banner__top-row__tournament-name"
            >
              {data.name}
            </Link>
          </div>
          <div className="info-banner__icon-buttons-container">
            {data.organizer.twitter && (
              // TODO: broken on Safari
              <a
                className="info-banner__icon-button"
                href={data.organizer.twitter}
              >
                <TwitterIcon />
              </a>
            )}
            <a
              className="info-banner__icon-button"
              href={data.organizer.discordInvite}
            >
              <DiscordIcon />
            </a>
          </div>
        </div>
        <div className="info-banner__bottom-row">
          <div className="info-banner__bottom-row__infos">
            <div className="info-banner__bottom-row__info-container">
              <div className="info-banner__bottom-row__info-label">
                Starting time
              </div>
              <time dateTime={data.startTime}>
                {weekdayAndStartTime(data.startTime)}
              </time>
            </div>
            <div className="info-banner__bottom-row__info-container">
              <div className="info-banner__bottom-row__info-label">Format</div>
              <div>{resolveTournamentFormatString(data.brackets)}</div>
            </div>
            <div className="info-banner__bottom-row__info-container">
              <div className="info-banner__bottom-row__info-label">
                Organizer
              </div>
              <div>{data.organizer.name}</div>
            </div>
          </div>
          <InfoBannerActionButton />
        </div>
      </div>
    </>
  );
}

// TODO: https://github.com/remix-run/remix/issues/656
function weekdayAndStartTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    weekday: "long",
    hour: "numeric",
  });
}

function shortMonthName(date: string) {
  return new Date(date).toLocaleString("en-US", { month: "short" });
}

function dayNumber(date: string) {
  return new Date(date).toLocaleString("en-US", { day: "numeric" });
}

function dateYYYYMMDD(date: string) {
  return new Date(date).toISOString().split("T")[0];
}

function InfoBannerActionButton() {
  const data = useLoaderData<FindTournamentByNameForUrlI>();
  const user = useUser();
  const location = useLocation();

  const isAlreadyInATeamButNotCaptain = data.teams
    .flatMap((team) => team.members)
    .filter(({ captain }) => !captain)
    .some(({ member }) => member.id === user?.id);
  if (isAlreadyInATeamButNotCaptain) return null;

  const alreadyRegistered = data.teams
    .flatMap((team) => team.members)
    .some(({ member }) => member.id === user?.id);
  if (alreadyRegistered) {
    return (
      <Link
        to="manage-team"
        className="info-banner__action-button"
        prefetch="intent"
      >
        Add players
      </Link>
    );
  }

  if (tournamentHasStarted(data.brackets)) {
    return null;
  }

  if (!user) {
    return (
      <form action={getLogInUrl(location)} method="post">
        <button
          className="info-banner__action-button"
          data-cy="log-in-to-join-button"
        >
          Log in to join
        </button>
      </form>
    );
  }

  return (
    <Link
      to="register"
      className="info-banner__action-button"
      data-cy="register-button"
    >
      Register
    </Link>
  );
}

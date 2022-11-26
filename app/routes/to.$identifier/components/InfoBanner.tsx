import { Link, useLocation } from "@remix-run/react";
import { DiscordIcon } from "~/components/icons/Discord";
import { resolveTournamentFormatString } from "~/modules/tournament/bracket";
import type { TournamentLoaderData } from "~/routes/to.$identifier";
import { databaseTimestampToDate } from "~/utils/dates";
import { discordFullName } from "~/utils/strings";

export function InfoBanner({ data }: { data: TournamentLoaderData }) {
  const location = useLocation();

  // xxx: fix
  const urlToTournamentFrontPage = location.pathname
    .split("/")
    .slice(0, 4)
    .join("/");

  const startTimeDate = databaseTimestampToDate(data.startTime);

  // xxx: expand discord link
  // xxx: fix dates before mount
  return (
    <>
      <div className="info-banner">
        <div className="info-banner__top-row">
          <div className="info-banner__top-row__date-name">
            <time
              dateTime={startTimeDate.toISOString().split("T")[0]}
              className="info-banner__top-row__month-date"
            >
              <div className="info-banner__top-row__month-date__month">
                {startTimeDate.toLocaleString("en-US", { month: "short" })}
              </div>
              <div className="info-banner__top-row__month-date__date">
                {startTimeDate.toLocaleString("en-US", { day: "numeric" })}
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
            <a className="info-banner__icon-button" href={data.discordUrl}>
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
              <time dateTime={startTimeDate.toISOString()}>
                {startTimeDate.toLocaleString("en-US", {
                  weekday: "long",
                  hour: "numeric",
                })}
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
              <div>{discordFullName(data.organizer)}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

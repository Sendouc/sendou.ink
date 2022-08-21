import { json, type LinksFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Main } from "~/components/Main";
import { db } from "~/db";
import styles from "~/styles/front-page.css";
import { databaseTimestampToDate } from "~/utils/dates";
import { discordFullName } from "~/utils/strings";
import { calendarEventPage, userPage } from "~/utils/urls";
import { Tags } from "./calendar/components/Tags";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = () => {
  return json({
    upcomingEvents: db.calendarEvents.upcomingEvents(),
    recentWinners: db.calendarEvents.recentWinners(),
  });
};

export default function Index() {
  return (
    <Main className="stack md">
      <Header />
      <CalendarPeek />
    </Main>
  );
}

function Header() {
  return (
    <div className="front__logo-container">
      <h1>sendou.ink</h1>
      <h2>Competitive Splatoon Hub</h2>
    </div>
  );
}

function CalendarPeek() {
  const data = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();

  return (
    <div className="front__calendar-peek-container">
      <h2>Recent winners</h2>
      {data.recentWinners.map((result) => (
        <Event
          key={result.eventId}
          eventId={result.eventId}
          eventName={result.eventName}
          startTimeString={databaseTimestampToDate(
            result.startTime
          ).toLocaleDateString(i18n.language, {
            day: "numeric",
            month: "numeric",
          })}
        >
          <ul className="front__event-winners">
            {result.players.map((player) => (
              <li
                key={typeof player === "string" ? player : player.id}
                className="flex items-center"
              >
                {typeof player === "string" ? (
                  player
                ) : (
                  <Link
                    to={userPage(player.discordId)}
                    className="stack horizontal xs items-center"
                  >
                    {discordFullName(player)}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Event>
      ))}
      <h2>Upcoming events</h2>
      {data.upcomingEvents.map((event) => (
        <Event
          key={event.eventId}
          eventId={event.eventId}
          eventName={event.eventName}
          // xxx: this and the buddy need to not be there before mount
          startTimeString={databaseTimestampToDate(
            event.startTime
          ).toLocaleString(i18n.language, {
            day: "numeric",
            month: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
        >
          <Tags tags={event.tags} badges={event.badgePrizes} />
        </Event>
      ))}
    </div>
  );
}

function Event({
  eventId,
  eventName,
  startTimeString,
  children,
}: {
  eventId: number;
  eventName: string;
  startTimeString: string;
  children: React.ReactNode;
}) {
  return (
    <div className="front__event">
      <Link to={calendarEventPage(eventId)} className="front__event-name">
        {eventName}
      </Link>
      <div className="front__event-time">{startTimeString}</div>
      <div className="front__event-content-below">{children}</div>
    </div>
  );
}

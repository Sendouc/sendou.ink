import { json, type LinksFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "~/components/icons/ArrowRight";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { db } from "~/db";
import { useIsMounted } from "~/hooks/useIsMounted";
import styles from "~/styles/front-page.css";
import { databaseTimestampToDate } from "~/utils/dates";
import { discordFullName } from "~/utils/strings";
import { calendarEventPage, CALENDAR_PAGE, userPage } from "~/utils/urls";
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
      <GoToPageBanner to={CALENDAR_PAGE} navItem="calendar">
        See all the past and upcoming events on the calendar page
      </GoToPageBanner>
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

function GoToPageBanner({
  children,
  to,
  navItem,
}: {
  children: React.ReactNode;
  to: string;
  navItem: string;
}) {
  return (
    <Link to={to} className="front__go-to-page-banner">
      <div className="front__go-to-page-banner__nav-img-container">
        <Image
          path={`/img/layout/${navItem}`}
          alt={navItem}
          width={32}
          height={32}
        />
      </div>
      {children}
      <ArrowRightIcon className="front__go-to-page-banner__arrow-right" />
    </Link>
  );
}

function CalendarPeek() {
  const data = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();

  return (
    <div className="front__calendar-peek-container">
      <div className="stack sm">
        <h2 className="front__calendar-header">Recent winners</h2>
        {data.recentWinners.map((result) => (
          <Event
            key={result.eventId}
            eventId={result.eventId}
            eventName={result.eventName}
            startTimeString={databaseTimestampToDate(
              result.startTime
            ).toLocaleDateString(i18n.language, {
              day: "numeric",
              month: "long",
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
      </div>
      <div className="stack sm">
        <h2 className="front__calendar-header">Upcoming events</h2>
        {data.upcomingEvents.map((event) => (
          <Event
            key={event.eventId}
            eventId={event.eventId}
            eventName={event.eventName}
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
  const isMounted = useIsMounted();

  return (
    <div className="front__event">
      <Link to={calendarEventPage(eventId)} className="front__event-name">
        {eventName}
      </Link>
      {isMounted && <div className="front__event-time">{startTimeString}</div>}
      <div className="front__event-content-below">{children}</div>
    </div>
  );
}

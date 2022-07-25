import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, type LinksFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { UseDataFunctionReturn } from "@remix-run/react/dist/components";
import clsx from "clsx";
import { addDays, subDays } from "date-fns";
import React from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { LinkButton } from "~/components/Button";
import { db } from "~/db";
import { useIsMounted } from "~/hooks/useIsMounted";
import { i18next } from "~/modules/i18n";
import styles from "~/styles/calendar.css";
import { joinListToNaturalString } from "~/utils/arrays";
import {
  databaseTimestampToDate,
  dateToWeekNumber,
  weekNumberToDate,
} from "~/utils/dates";
import { discordFullName, makeTitle } from "~/utils/strings";
import { resolveBaseUrl } from "~/utils/urls";
import { actualNumber } from "~/utils/zod";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = (args) => {
  const data = args.data as Nullable<UseDataFunctionReturn<typeof loader>>;

  if (!data) return {};

  return {
    title: data.title,
    description: `${data.events.length} events happening during week ${
      data.thisWeek
    } including ${joinListToNaturalString(
      data.events.slice(0, 3).map((e) => e.name)
    )}`,
  };
};

const loaderSearchParamsSchema = z.object({
  week: z.preprocess(actualNumber, z.number().int().min(1).max(53)),
  year: z.preprocess(
    actualNumber,
    z.number().int().min(2022).max(new Date().getFullYear())
  ),
});

export const loader = async ({ request }: LoaderArgs) => {
  const t = await i18next.getFixedT(request);
  const url = new URL(request.url);
  const parsedParams = loaderSearchParamsSchema.safeParse({
    year: url.searchParams.get("year"),
    week: url.searchParams.get("week"),
  });

  const now = new Date();
  const thisWeek = dateToWeekNumber(now);

  const weekToFetch = parsedParams.success ? parsedParams.data.week : thisWeek;
  const yearToFetch = parsedParams.success
    ? parsedParams.data.year
    : now.getFullYear();

  return json({
    thisWeek,
    weeks: closeByWeeks({ week: weekToFetch, year: yearToFetch }).map(
      (week) => ({
        ...week,
        numberOfEvents: 12,
      })
    ),
    events: fetchEventsOfWeek({ week: weekToFetch, year: yearToFetch }),
    title: makeTitle([`Week ${weekToFetch}`, t("pages.calendar")]),
  });
};

function closeByWeeks(args: { week: number; year: number }) {
  const dateFromWeekNumber = weekNumberToDate(args);

  return [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((week) => {
    const date =
      week < 0
        ? subDays(dateFromWeekNumber, Math.abs(week) * 7)
        : addDays(dateFromWeekNumber, week * 7);

    return {
      number: dateToWeekNumber(date),
      year: date.getFullYear(),
    };
  });
}

function fetchEventsOfWeek(args: { week: number; year: number }) {
  const startTime = weekNumberToDate(args);

  const endTime = new Date(startTime);
  endTime.setDate(endTime.getDate() + 7);
  // so we get all events of sunday even from US west coast perspective
  endTime.setHours(endTime.getHours() + 12);

  return db.calendar.findAllBetweenTwoTimestamps({ startTime, endTime });
}

export default function CalendarPage() {
  const data = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();

  // there is hydration mismatch error if we render
  // dates/times on the server
  const isMounted = useIsMounted();

  // xxx: scrolls down on page load?
  // xxx: instead calculate into object
  const datesRendered = new Set<string>();
  return (
    <main>
      <WeekLinks />
      <div className="calendar__events-container">
        {data.events.map((event) => {
          const dateString = databaseTimestampToDate(
            event.startTime
          ).toLocaleDateString(i18n.language, {
            weekday: "long",
            day: "numeric",
            month: "long",
          });
          const renderDateString = !datesRendered.has(dateString);
          datesRendered.add(dateString);

          return (
            <React.Fragment key={event.id}>
              <div
                className={clsx("calendar__event__date-container", {
                  invisible: !isMounted || !renderDateString,
                })}
              >
                <div className="calendar__event__date main">
                  {isMounted ? dateString : null}
                </div>
              </div>
              <section className="calendar__event main">
                <div
                  className={clsx("calendar__event__top-info-container", {
                    invisible: !isMounted,
                  })}
                >
                  <time
                    dateTime={databaseTimestampToDate(
                      event.startTime
                    ).toISOString()}
                    className="calendar__event__time"
                  >
                    {isMounted
                      ? databaseTimestampToDate(
                          event.startTime
                        ).toLocaleTimeString(i18n.language, {
                          hour: "numeric",
                          minute: "numeric",
                        })
                      : null}
                  </time>
                  <div className="calendar__event__author">
                    From {discordFullName(event)}
                  </div>
                </div>
                <Link to={String(event.eventId)}>
                  <h2 className="calendar__event__title">{event.name}</h2>
                </Link>
                {event.discordUrl || event.bracketUrl ? (
                  <div className="calendar__event__bottom-info-container">
                    {event.discordUrl ? (
                      <LinkButton
                        to={event.discordUrl}
                        variant="outlined"
                        tiny
                        isExternal
                      >
                        Discord
                      </LinkButton>
                    ) : null}
                    {event.bracketUrl ? (
                      <LinkButton
                        to={event.bracketUrl}
                        variant="outlined"
                        tiny
                        isExternal
                      >
                        {resolveBaseUrl(event.bracketUrl)}
                      </LinkButton>
                    ) : null}
                  </div>
                ) : null}
              </section>
            </React.Fragment>
          );
        })}
      </div>
    </main>
  );
}

function WeekLinks() {
  const data = useLoaderData<typeof loader>();

  return (
    <Flipper flipKey={data.weeks.map(({ number }) => number).join("")}>
      <div className="flex justify-center">
        <div className="calendar__weeks">
          {data.weeks.map((week, i) => {
            const hidden = [
              0,
              1,
              data.weeks.length - 2,
              data.weeks.length - 1,
            ].includes(i);

            return (
              <Flipped key={week.number} flipId={week.number}>
                <Link
                  to={`?week=${week.number}&year=${week.year}`}
                  className="calendar__week"
                  aria-hidden={hidden}
                  tabIndex={hidden ? -1 : 0}
                >
                  <>
                    <div>
                      {week.number === data.thisWeek
                        ? "This"
                        : week.number - data.thisWeek === 1
                        ? "Next"
                        : week.number - data.thisWeek === -1
                        ? "Last"
                        : week.number}{" "}
                      <br />
                      Week
                    </div>
                    <div className="calendar__event-count">
                      ×{week.numberOfEvents}
                    </div>
                  </>
                </Link>
              </Flipped>
            );
          })}
        </div>
      </div>
    </Flipper>
  );
}

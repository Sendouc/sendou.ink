import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, type LinksFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { UseDataFunctionReturn } from "@remix-run/react/dist/components";
import clsx from "clsx";
import { addDays, addMonths, subDays, subMonths } from "date-fns";
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
import type { Unpacked } from "~/utils/types";
import { resolveBaseUrl } from "~/utils/urls";
import { actualNumber } from "~/utils/zod";
import { Tags } from "./components/Tags";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = (args) => {
  const data = args.data as Nullable<UseDataFunctionReturn<typeof loader>>;

  if (!data) return {};

  return {
    title: data.title,
    description: `${data.events.length} events happening during week ${
      data.displayedWeek
    } including ${joinListToNaturalString(
      data.events.slice(0, 3).map((e) => e.name)
    )}`,
  };
};

export const handle = {
  i18n: "calendar",
};

const loaderSearchParamsSchema = z.object({
  week: z.preprocess(actualNumber, z.number().int().min(1).max(53)),
  year: z.preprocess(actualNumber, z.number().int()),
});

export const loader = async ({ request }: LoaderArgs) => {
  const t = await i18next.getFixedT(request);
  const url = new URL(request.url);
  const parsedParams = loaderSearchParamsSchema.safeParse({
    year: url.searchParams.get("year"),
    week: url.searchParams.get("week"),
  });

  const now = new Date();
  const currentWeek = dateToWeekNumber(now);

  const displayedWeek = parsedParams.success
    ? parsedParams.data.week
    : currentWeek;
  const displayedYear = parsedParams.success
    ? parsedParams.data.year
    : now.getFullYear();

  return json({
    currentWeek,
    displayedWeek,
    nearbyStartTimes: db.calendar.startTimesOfRange({
      startTime: subMonths(
        weekNumberToDate({ week: displayedWeek, year: displayedYear }),
        1
      ),
      endTime: addMonths(
        weekNumberToDate({ week: displayedWeek, year: displayedYear }),
        1
      ),
    }),
    weeks: closeByWeeks({ week: displayedWeek, year: displayedYear }),
    events: fetchEventsOfWeek({ week: displayedWeek, year: displayedYear }),
    title: makeTitle([`Week ${displayedWeek}`, t("pages.calendar")]),
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
  const isMounted = useIsMounted();

  return (
    <main className="stack lg">
      <WeekLinks />
      {isMounted ? <EventsList /> : <div className="calendar__placeholder" />}
    </main>
  );
}

function WeekLinks() {
  const data = useLoaderData<typeof loader>();
  const isMounted = useIsMounted();

  const eventCounts = isMounted
    ? getEventsCountPerWeek(data.nearbyStartTimes)
    : null;

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
                  className={clsx("calendar__week", { invisible: hidden })}
                  aria-hidden={hidden}
                  tabIndex={hidden ? -1 : 0}
                >
                  <>
                    <WeekLinkTitle week={week} />
                    <div
                      className={clsx("calendar__event-count", {
                        invisible: !eventCounts,
                      })}
                    >
                      ×{eventCounts?.get(week.number) ?? 0}
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

function WeekLinkTitle({
  week,
}: {
  week: Unpacked<UseDataFunctionReturn<typeof loader>["weeks"]>;
}) {
  const data = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();

  const relativeWeekIdentifier =
    week.number === data.currentWeek
      ? "This"
      : week.number - data.currentWeek === 1
      ? "Next"
      : week.number - data.currentWeek === -1
      ? "Last"
      : null;

  if (relativeWeekIdentifier) {
    return (
      <div className="stack xxs">
        <div>{relativeWeekIdentifier}</div>
        <div>Week</div>
      </div>
    );
  }

  return (
    <div>
      <div>
        {weekNumberToDate({
          week: week.number,
          year: week.year,
        }).toLocaleDateString(i18n.language, {
          day: "numeric",
          month: "short",
        })}
      </div>
      <div className="calendar__week__dash">-</div>
      <div>
        {weekNumberToDate({
          week: week.number,
          year: week.year,
          position: "end",
        }).toLocaleDateString(i18n.language, {
          day: "numeric",
          month: "short",
        })}
      </div>
    </div>
  );
}

function getEventsCountPerWeek(
  startTimes: UseDataFunctionReturn<typeof loader>["nearbyStartTimes"]
) {
  const result = new Map<number, number>();

  for (const startTime of startTimes) {
    const week = dateToWeekNumber(databaseTimestampToDate(startTime));
    const previousCount = result.get(week) ?? 0;
    result.set(week, previousCount + 1);
  }

  return result;
}

function EventsList() {
  const data = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();

  function excludeNextWeeksEvents([date]: Unpacked<
    ReturnType<typeof eventsGroupedByDay>
  >) {
    return dateToWeekNumber(date) === data.displayedWeek;
  }

  return (
    <div className="calendar__events-container">
      {eventsGroupedByDay(data.events)
        .filter(excludeNextWeeksEvents)
        .map(([daysDate, events]) => {
          return (
            <React.Fragment key={daysDate.getTime()}>
              <div className="calendar__event__date-container">
                <div className="calendar__event__date main">
                  {daysDate.toLocaleDateString(i18n.language, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </div>
              </div>
              <div className="stack md">
                {events.flatMap((calendarEvent, i) => {
                  return [
                    <section
                      key={calendarEvent.eventId}
                      className="calendar__event main stack md"
                    >
                      <div className="stack sm">
                        <div
                          className={clsx(
                            "calendar__event__top-info-container",
                            {
                              "mt-4": i === 0,
                            }
                          )}
                        >
                          <time
                            dateTime={databaseTimestampToDate(
                              calendarEvent.startTime
                            ).toISOString()}
                            className="calendar__event__time"
                          >
                            {databaseTimestampToDate(
                              calendarEvent.startTime
                            ).toLocaleTimeString(i18n.language, {
                              hour: "numeric",
                              minute: "numeric",
                            })}
                          </time>
                          <div className="calendar__event__author">
                            From {discordFullName(calendarEvent)}
                          </div>
                        </div>
                        <div className="stack sm">
                          <Link to={String(calendarEvent.eventId)}>
                            <h2 className="calendar__event__title">
                              {calendarEvent.name}{" "}
                              {calendarEvent.nthAppearance > 1 ? (
                                <span className="calendar__event__day">
                                  Day {calendarEvent.nthAppearance}
                                </span>
                              ) : null}
                            </h2>
                          </Link>
                          <Tags tags={calendarEvent.tags} />
                        </div>
                      </div>
                      {calendarEvent.discordUrl || calendarEvent.bracketUrl ? (
                        <div className="calendar__event__bottom-info-container">
                          {calendarEvent.discordUrl ? (
                            <LinkButton
                              to={calendarEvent.discordUrl}
                              variant="outlined"
                              tiny
                              isExternal
                            >
                              Discord
                            </LinkButton>
                          ) : null}
                          {calendarEvent.bracketUrl ? (
                            <LinkButton
                              to={calendarEvent.bracketUrl}
                              variant="outlined"
                              tiny
                              isExternal
                            >
                              {resolveBaseUrl(calendarEvent.bracketUrl)}
                            </LinkButton>
                          ) : null}
                        </div>
                      ) : null}
                    </section>,
                    i < events.length - 1 ? (
                      <hr
                        key={`${calendarEvent.eventId}-line`}
                        className="calendar__event__divider"
                      />
                    ) : null,
                  ];
                })}
              </div>
            </React.Fragment>
          );
        })}
    </div>
  );
}

function eventsGroupedByDay(
  events: UseDataFunctionReturn<typeof loader>["events"]
) {
  const result: Array<[Date, UseDataFunctionReturn<typeof loader>["events"]]> =
    [];

  for (const calendarEvent of events) {
    const previousIterationEvents = result[result.length - 1] ?? null;

    const eventsDate = databaseTimestampToDate(calendarEvent.startTime);
    if (
      !previousIterationEvents ||
      previousIterationEvents[0].getDay() !== eventsDate.getDay()
    ) {
      result.push([eventsDate, [calendarEvent]]);
    } else {
      previousIterationEvents[1].push(calendarEvent);
    }
  }

  return result;
}

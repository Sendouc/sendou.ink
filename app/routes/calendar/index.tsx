import type { LoaderArgs, MetaFunction, SerializeFrom } from "@remix-run/node";
import { json, type LinksFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { addDays, addMonths, subDays, subMonths } from "date-fns";
import React from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Alert } from "~/components/Alert";
import { LinkButton } from "~/components/Button";
import { db } from "~/db";
import { useIsMounted } from "~/hooks/useIsMounted";
import { getUser, useUser } from "~/modules/auth";
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
import { calendarReportWinnersPage, resolveBaseUrl } from "~/utils/urls";
import { actualNumber } from "~/utils/zod";
import { Tags } from "./components/Tags";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader> | null;

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
  const user = await getUser(request);
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
    nearbyStartTimes: db.calendarEvents.startTimesOfRange({
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
    eventsToReport: db.calendarEvents.eventsToReport(user?.id),
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

  // handle timezone mismatch between server and client
  startTime.setHours(startTime.getHours() - 12);
  endTime.setHours(endTime.getHours() + 12);

  return db.calendarEvents.findAllBetweenTwoTimestamps({ startTime, endTime });
}

export default function CalendarPage() {
  const { t } = useTranslation("calendar");
  const data = useLoaderData<typeof loader>();
  const user = useUser();
  const isMounted = useIsMounted();

  // we don't know which events are starting in user's time zone on server
  // so that's why this calculation is not in the loader
  const thisWeeksEvents = isMounted
    ? data.events.filter(
        (event) =>
          dateToWeekNumber(databaseTimestampToDate(event.startTime)) ===
          data.displayedWeek
      )
    : data.events;

  return (
    <main className="stack lg layout__main">
      <WeekLinks />
      <EventsToReport />
      <div className="stack md">
        {user && (
          <LinkButton to="new" className="calendar__add-new-button" tiny>
            {t("addNew")}
          </LinkButton>
        )}
        {isMounted ? (
          <>
            {thisWeeksEvents.length > 0 ? (
              <>
                <EventsList events={thisWeeksEvents} />
                <div className="calendar__time-zone-info">
                  {t("inYourTimeZone")}{" "}
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </div>
              </>
            ) : (
              <h2 className="calendar__no-events" data-cy="no-events">
                {t("noEvents")}
              </h2>
            )}
          </>
        ) : (
          <div className="calendar__placeholder" />
        )}
      </div>
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

            const isCurrentWeek = i == 4;

            return (
              <Flipped key={week.number} flipId={week.number}>
                <Link
                  to={`?week=${week.number}&year=${week.year}`}
                  className={clsx("calendar__week", { invisible: hidden })}
                  aria-hidden={hidden}
                  tabIndex={hidden || isCurrentWeek ? -1 : 0}
                  onClick={(e) => isCurrentWeek && e.preventDefault()}
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
  week: Unpacked<SerializeFrom<typeof loader>["weeks"]>;
}) {
  const { t } = useTranslation("calendar");
  const data = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();

  const relativeWeekIdentifier =
    week.number === data.currentWeek
      ? t("week.this")
      : week.number - data.currentWeek === 1
      ? t("week.next")
      : week.number - data.currentWeek === -1
      ? t("week.last")
      : null;

  if (relativeWeekIdentifier) {
    return (
      <div className="stack xxs">
        <div>{relativeWeekIdentifier}</div>
        <div>{t("week.week")}</div>
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
  startTimes: SerializeFrom<typeof loader>["nearbyStartTimes"]
) {
  const result = new Map<number, number>();

  for (const startTime of startTimes) {
    const week = dateToWeekNumber(databaseTimestampToDate(startTime));
    const previousCount = result.get(week) ?? 0;
    result.set(week, previousCount + 1);
  }

  return result;
}

function EventsToReport() {
  const { t } = useTranslation("calendar");
  const data = useLoaderData<typeof loader>();

  if (data.eventsToReport.length === 0) return null;

  return (
    <Alert textClassName="calendar__events-to-report">
      {t("reportResults")}{" "}
      {data.eventsToReport.map((event, i) => (
        <React.Fragment key={event.id}>
          <Link to={calendarReportWinnersPage(event.id)}>{event.name}</Link>
          {i === data.eventsToReport.length - 1 ? "" : ", "}
        </React.Fragment>
      ))}
    </Alert>
  );
}

function EventsList({
  events,
}: {
  events: SerializeFrom<typeof loader>["events"];
}) {
  const { t, i18n } = useTranslation("calendar");

  return (
    <div className="calendar__events-container">
      {eventsGroupedByDay(events).map(([daysDate, events]) => {
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
              {events.map((calendarEvent, i) => {
                return (
                  <React.Fragment key={calendarEvent.eventDateId}>
                    <section className="calendar__event main stack md">
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
                        <div className="stack xs">
                          <Link
                            to={String(calendarEvent.eventId)}
                            data-cy="event-page-link"
                          >
                            <h2 className="calendar__event__title">
                              {calendarEvent.name}{" "}
                              {calendarEvent.nthAppearance > 1 ? (
                                <span className="calendar__event__day">
                                  {t("day", {
                                    number: calendarEvent.nthAppearance,
                                  })}
                                </span>
                              ) : null}
                            </h2>
                          </Link>
                          <Tags
                            tags={calendarEvent.tags}
                            badges={calendarEvent.badgePrizes}
                          />
                        </div>
                      </div>
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
                        <LinkButton
                          to={calendarEvent.bracketUrl}
                          variant="outlined"
                          tiny
                          isExternal
                        >
                          {resolveBaseUrl(calendarEvent.bracketUrl)}
                        </LinkButton>
                      </div>
                    </section>
                    {i < events.length - 1 ? (
                      <hr className="calendar__event__divider" />
                    ) : null}
                  </React.Fragment>
                );
              })}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function eventsGroupedByDay(events: SerializeFrom<typeof loader>["events"]) {
  const result: Array<[Date, SerializeFrom<typeof loader>["events"]]> = [];

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

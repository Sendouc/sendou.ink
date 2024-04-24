import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { addDays, addMonths, subDays, subMonths } from "date-fns";
import React from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Alert } from "~/components/Alert";
import { LinkButton } from "~/components/Button";
import { Divider } from "~/components/Divider";
import { Main } from "~/components/Main";
import { UsersIcon } from "~/components/icons/Users";
import { useUser } from "~/features/auth/core/user";
import { getUserId } from "~/features/auth/core/user.server";
import { HACKY_resolvePicture } from "~/features/tournament/tournament-utils";
import { useIsMounted } from "~/hooks/useIsMounted";
import { i18next } from "~/modules/i18n/i18next.server";
import { joinListToNaturalString } from "~/utils/arrays";
import {
  databaseTimestampToDate,
  dateToThisWeeksMonday,
  dateToWeekNumber,
  dayToWeekStartsAtMondayDay,
  getWeekStartsAtMondayDay,
  weekNumberToDate,
} from "~/utils/dates";
import { type SendouRouteHandle } from "~/utils/remix";
import { discordFullName, makeTitle } from "~/utils/strings";
import type { Unpacked } from "~/utils/types";
import {
  CALENDAR_PAGE,
  calendarReportWinnersPage,
  navIconUrl,
  resolveBaseUrl,
  tournamentPage,
} from "~/utils/urls";
import { actualNumber } from "~/utils/zod";
import * as CalendarRepository from "../CalendarRepository.server";
import { canAddNewEvent } from "../calendar-utils";
import { Tags } from "../components/Tags";
import { Image } from "~/components/Image";
import { Toggle } from "~/components/Toggle";
import { Label } from "~/components/Label";

import "~/styles/calendar.css";

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader> | null;

  if (!data) return [];

  return [
    { title: data.title },
    {
      name: "description",
      content: `${data.events.length} events happening during week ${
        data.displayedWeek
      } including ${joinListToNaturalString(
        data.events.slice(0, 3).map((e) => e.name),
      )}`,
    },
  ];
};

export const handle: SendouRouteHandle = {
  i18n: "calendar",
  breadcrumb: () => ({
    imgPath: navIconUrl("calendar"),
    href: CALENDAR_PAGE,
    type: "IMAGE",
  }),
};

const loaderSearchParamsSchema = z.object({
  week: z.preprocess(actualNumber, z.number().int().min(1).max(53)),
  year: z.preprocess(actualNumber, z.number().int()),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserId(request);
  const t = await i18next.getFixedT(request);
  const url = new URL(request.url);
  const parsedParams = loaderSearchParamsSchema.safeParse({
    year: url.searchParams.get("year"),
    week: url.searchParams.get("week"),
  });

  const mondayDate = dateToThisWeeksMonday(new Date());
  const currentWeek = dateToWeekNumber(mondayDate);

  const displayedWeek = parsedParams.success
    ? parsedParams.data.week
    : currentWeek;
  const displayedYear = parsedParams.success
    ? parsedParams.data.year
    : mondayDate.getFullYear();

  return json({
    currentWeek,
    displayedWeek,
    currentDay: new Date().getDay(),
    nearbyStartTimes: await CalendarRepository.startTimesOfRange({
      startTime: subMonths(
        weekNumberToDate({ week: displayedWeek, year: displayedYear }),
        1,
      ),
      endTime: addMonths(
        weekNumberToDate({ week: displayedWeek, year: displayedYear }),
        1,
      ),
    }),
    weeks: closeByWeeks({ week: displayedWeek, year: displayedYear }),
    events: await fetchEventsOfWeek({
      week: displayedWeek,
      year: displayedYear,
    }),
    eventsToReport: user
      ? await CalendarRepository.eventsToReport(user.id)
      : [],
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

  return CalendarRepository.findAllBetweenTwoTimestamps({ startTime, endTime });
}

export default function CalendarPage() {
  const { t } = useTranslation("calendar");
  const data = useLoaderData<typeof loader>();
  const user = useUser();
  const isMounted = useIsMounted();
  const [onlySendouInkEvents, setOnlySendouInkEvents] = React.useState(false);

  const filteredEvents = onlySendouInkEvents
    ? data.events.filter((event) => event.tournamentId)
    : data.events;

  // we don't know which events are starting in user's time zone on server
  // so that's why this calculation is not in the loader
  const thisWeeksEvents = isMounted
    ? filteredEvents.filter(
        (event) =>
          dateToWeekNumber(databaseTimestampToDate(event.startTime)) ===
          data.displayedWeek,
      )
    : filteredEvents;

  return (
    <Main classNameOverwrite="stack lg main layout__main">
      <WeekLinks />
      <EventsToReport />
      <div className="stack md">
        <div className="stack horizontal justify-between">
          <div className="stack horizontal sm items-center">
            <Toggle
              id="onlySendouInk"
              tiny
              checked={onlySendouInkEvents}
              setChecked={setOnlySendouInkEvents}
            />
            <Label spaced={false} htmlFor="onlySendouInk">
              Only sendou.ink events
            </Label>
          </div>
          {user && canAddNewEvent(user) && (
            <LinkButton to="new" size="tiny" className="w-max">
              {t("addNew")}
            </LinkButton>
          )}
        </div>
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
              <h2 className="calendar__no-events">{t("noEvents")}</h2>
            )}
          </>
        ) : (
          <div className="calendar__placeholder" />
        )}
      </div>
    </Main>
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

  const isSameYear = week.year === new Date().getFullYear();
  const relativeWeekIdentifier =
    week.number === data.currentWeek && isSameYear
      ? t("week.this")
      : week.number - data.currentWeek === 1 && isSameYear
        ? t("week.next")
        : week.number - data.currentWeek === -1 && isSameYear
          ? t("week.last")
          : null;

  if (relativeWeekIdentifier) {
    return (
      <div className="calendar__week__relative">
        <div>{relativeWeekIdentifier}</div>
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
  startTimes: SerializeFrom<typeof loader>["nearbyStartTimes"],
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
  const data = useLoaderData<typeof loader>();
  const { t, i18n } = useTranslation("calendar");

  const sortPastEventsLast = data.currentWeek === data.displayedWeek;

  const eventsGrouped = eventsGroupedByDay(events);
  if (sortPastEventsLast) {
    eventsGrouped.sort(
      pastEventsLast(dayToWeekStartsAtMondayDay(data.currentDay)),
    );
  }

  let dividerRendered = false;
  return (
    <div className="calendar__events-container">
      {eventsGrouped.map(([daysDate, events]) => {
        const renderDivider =
          sortPastEventsLast &&
          !dividerRendered &&
          getWeekStartsAtMondayDay(daysDate) <
            dayToWeekStartsAtMondayDay(data.currentDay);
        if (renderDivider) {
          dividerRendered = true;
        }

        const sectionWeekday = daysDate.toLocaleString(i18n.language, {
          weekday: "long",
        });

        return (
          <React.Fragment key={daysDate.getTime()}>
            <div className="calendar__event__date-container">
              {renderDivider ? (
                <Divider className="calendar__event__divider">
                  {t("pastEvents.dividerText")}
                </Divider>
              ) : null}
              <div className="calendar__event__date main">
                {daysDate.toLocaleDateString(i18n.language, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </div>
            </div>
            <div className="stack md">
              {events.map((calendarEvent) => {
                const eventWeekday = databaseTimestampToDate(
                  calendarEvent.startTime,
                ).toLocaleString(i18n.language, {
                  weekday: "long",
                });

                return (
                  <section
                    key={calendarEvent.eventDateId}
                    className="calendar__event main stack md"
                  >
                    <div className="stack sm">
                      <div className="calendar__event__top-info-container">
                        <time
                          dateTime={databaseTimestampToDate(
                            calendarEvent.startTime,
                          ).toISOString()}
                          className="calendar__event__time"
                        >
                          {databaseTimestampToDate(
                            calendarEvent.startTime,
                          ).toLocaleTimeString(i18n.language, {
                            hour: "numeric",
                            minute: "numeric",
                          })}
                        </time>
                        <div className="calendar__event__author">
                          {t("from", {
                            author: discordFullName(calendarEvent),
                          })}
                        </div>
                        {sectionWeekday !== eventWeekday ? (
                          <div className="text-xxs font-bold text-theme-secondary ml-auto">
                            {eventWeekday}
                          </div>
                        ) : null}
                      </div>
                      <div className="stack xs">
                        <div className="stack horizontal sm-plus items-center">
                          {calendarEvent.tournamentId ? (
                            <Image
                              path={HACKY_resolvePicture({
                                name: calendarEvent.name,
                              })}
                              alt=""
                              size={40}
                              className="calendar__event-logo"
                            />
                          ) : null}
                          <div>
                            <Link
                              to={
                                calendarEvent.tournamentId
                                  ? tournamentPage(calendarEvent.tournamentId)
                                  : String(calendarEvent.eventId)
                              }
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
                            {calendarEvent.participantCounts &&
                            calendarEvent.participantCounts.teams > 0 ? (
                              <div className="calendar__event__participant-counts">
                                <UsersIcon />{" "}
                                {t("count.teams", {
                                  count: calendarEvent.participantCounts.teams,
                                })}{" "}
                                /{" "}
                                {t("count.players", {
                                  count:
                                    calendarEvent.participantCounts.players,
                                })}
                              </div>
                            ) : null}
                          </div>
                        </div>
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
                          size="tiny"
                          isExternal
                        >
                          Discord
                        </LinkButton>
                      ) : null}
                      {!calendarEvent.tournamentId ? (
                        <LinkButton
                          to={calendarEvent.bracketUrl}
                          variant="outlined"
                          size="tiny"
                          isExternal
                        >
                          {resolveBaseUrl(calendarEvent.bracketUrl)}
                        </LinkButton>
                      ) : null}
                    </div>
                  </section>
                );
              })}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Goal with this is to make events that start during the night for EU (NA events)
// grouped up with the previous day. Otherwise you have a past event showing at the
// top of the page for the whole following day for EU.
const dateToSixHoursAgo = (date: Date) => {
  const sixHoursAgo = new Date(date);
  sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
  return sixHoursAgo;
};

type EventsGrouped = [Date, SerializeFrom<typeof loader>["events"]];
function eventsGroupedByDay(events: SerializeFrom<typeof loader>["events"]) {
  const result: EventsGrouped[] = [];

  for (const calendarEvent of events) {
    const previousIterationEvents = result[result.length - 1] ?? null;

    const eventsDate = dateToSixHoursAgo(
      databaseTimestampToDate(calendarEvent.startTime),
    );

    if (
      !previousIterationEvents ||
      dateToSixHoursAgo(previousIterationEvents[0]).getDay() !==
        eventsDate.getDay()
    ) {
      result.push([eventsDate, [calendarEvent]]);
    } else {
      previousIterationEvents[1].push(calendarEvent);
    }
  }

  return result;
}

function pastEventsLast(currentDay: number) {
  return function (a: EventsGrouped, b: EventsGrouped) {
    const aDay = getWeekStartsAtMondayDay(a[0]);
    const bDay = getWeekStartsAtMondayDay(b[0]);

    if (aDay < currentDay && bDay >= currentDay) {
      return 1;
    }

    if (aDay >= currentDay && bDay < currentDay) {
      return -1;
    }

    return 0;
  };
}

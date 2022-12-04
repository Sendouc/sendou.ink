import type { ActionFunction, SerializeFrom } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  json,
  type MetaFunction,
  type LinksFunction,
  type LoaderArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Link } from "@remix-run/react/dist/components";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "~/hooks/useTranslation";
import { z } from "zod";
import { Avatar } from "~/components/Avatar";
import { Button, LinkButton } from "~/components/Button";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { Placement } from "~/components/Placement";
import { Section } from "~/components/Section";
import { db } from "~/db";
import { useIsMounted } from "~/hooks/useIsMounted";
import { requireUser, useUser } from "~/modules/auth";
import { i18next } from "~/modules/i18n";
import {
  canDeleteCalendarEvent,
  canEditCalendarEvent,
  canReportCalendarEventWinners,
} from "~/permissions";
import calendarStyles from "~/styles/calendar-event.css";
import mapsStyles from "~/styles/maps.css";
import { databaseTimestampToDate } from "~/utils/dates";
import {
  notFoundIfFalsy,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { discordFullName, makeTitle } from "~/utils/strings";
import {
  calendarEditPage,
  calendarEventPage,
  calendarReportWinnersPage,
  CALENDAR_PAGE,
  navIconUrl,
  readonlyMapsPage,
  resolveBaseUrl,
  userPage,
} from "~/utils/urls";
import { actualNumber, id } from "~/utils/zod";
import { MapPoolStages } from "~/components/MapPoolSelector";
import { Tags } from "../components/Tags";
import { MapPool } from "~/modules/map-pool-serializer";
import { FormWithConfirm } from "~/components/FormWithConfirm";

export const action: ActionFunction = async ({ params, request }) => {
  const user = await requireUser(request);
  const parsedParams = z
    .object({ id: z.preprocess(actualNumber, id) })
    .parse(params);
  const event = notFoundIfFalsy(db.calendarEvents.findById(parsedParams.id));

  validate(
    canDeleteCalendarEvent({
      user,
      event,
      startTime: databaseTimestampToDate(event.startTimes[0]!),
    }),
    403
  );

  db.calendarEvents.deleteById(event.eventId);

  return redirect(CALENDAR_PAGE);
};

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: calendarStyles },
    { rel: "stylesheet", href: mapsStyles },
  ];
};

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader>;

  if (!data) return {};

  return {
    title: data.title,
    description: data.event.description,
  };
};

export const handle: SendouRouteHandle = {
  i18n: ["calendar", "game-misc"],
  breadcrumb: ({ match }) => {
    const data = match.data as SerializeFrom<typeof loader>;
    return [
      {
        imgPath: navIconUrl("calendar"),
        href: CALENDAR_PAGE,
        type: "IMAGE",
      },
      {
        text: data.event.name,
        href: calendarEventPage(data.event.eventId),
        type: "TEXT",
      },
    ];
  },
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const t = await i18next.getFixedT(request);
  const parsedParams = z
    .object({ id: z.preprocess(actualNumber, id) })
    .parse(params);
  const event = notFoundIfFalsy(db.calendarEvents.findById(parsedParams.id));

  return json({
    event,
    badgePrizes: db.calendarEvents.findBadgesByEventId(parsedParams.id),
    title: makeTitle([event.name, t("pages.calendar")]),
    results: db.calendarEvents.findResultsByEventId(parsedParams.id),
    mapPool: db.calendarEvents.findMapPoolByEventId(parsedParams.id),
  });
};

export default function CalendarEventPage() {
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const { i18n, t } = useTranslation(["common", "calendar"]);
  const isMounted = useIsMounted();

  return (
    <Main className="stack lg">
      <section className="stack sm">
        <div className="event__times">
          {data.event.startTimes.map((startTime, i) => (
            <React.Fragment key={startTime}>
              <span
                className={clsx("event__day", {
                  hidden: data.event.startTimes.length === 1,
                })}
              >
                {t("calendar:day", {
                  number: i + 1,
                })}
              </span>
              <time dateTime={databaseTimestampToDate(startTime).toISOString()}>
                {isMounted
                  ? databaseTimestampToDate(startTime).toLocaleDateString(
                      i18n.language,
                      {
                        hour: "numeric",
                        minute: "numeric",
                        day: "numeric",
                        month: "long",
                        weekday: "long",
                        year: "numeric",
                      }
                    )
                  : null}
              </time>
            </React.Fragment>
          ))}
        </div>
        <div className="stack md">
          <div className="stack xs">
            <h2>{data.event.name}</h2>
            <Tags tags={data.event.tags} badges={data.badgePrizes} />
          </div>
          <div className="stack horizontal sm flex-wrap">
            {data.event.discordUrl ? (
              <LinkButton
                to={data.event.discordUrl}
                variant="outlined"
                tiny
                isExternal
              >
                Discord
              </LinkButton>
            ) : null}
            <LinkButton
              to={data.event.bracketUrl}
              variant="outlined"
              tiny
              isExternal
            >
              {resolveBaseUrl(data.event.bracketUrl)}
            </LinkButton>
            {canEditCalendarEvent({ user, event: data.event }) && (
              <LinkButton tiny to={calendarEditPage(data.event.eventId)}>
                {t("common:actions.edit")}
              </LinkButton>
            )}
            {canReportCalendarEventWinners({
              user,
              event: data.event,
              startTimes: data.event.startTimes,
            }) && (
              <LinkButton
                tiny
                to={calendarReportWinnersPage(data.event.eventId)}
              >
                {t("calendar:actions.reportWinners")}
              </LinkButton>
            )}
          </div>
        </div>
      </section>
      <Results />
      <MapPoolInfo />
      <div className="stack md">
        <Description />
        {canDeleteCalendarEvent({
          user,
          startTime: databaseTimestampToDate(data.event.startTimes[0]!),
          event: data.event,
        }) ? (
          <FormWithConfirm
            dialogHeading={t("calendar:actions.delete.confirm", {
              name: data.event.name,
            })}
          >
            <Button
              className="ml-auto"
              tiny
              variant="minimal-destructive"
              type="submit"
            >
              {t("calendar:actions.delete")}
            </Button>
          </FormWithConfirm>
        ) : null}
      </div>
    </Main>
  );
}

function Results() {
  const { t } = useTranslation(["common", "calendar"]);
  const data = useLoaderData<typeof loader>();

  if (!data.results.length) return null;

  return (
    <Section title={t("calendar:results")} className="event__results-section">
      {data.event.participantCount && (
        <div className="event__results-participant-count">
          {t("calendar:participatedCount", {
            count: data.event.participantCount,
          })}
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>{t("calendar:forms.team.placing")}</th>
            <th>{t("common:forms.name")}</th>
            <th>{t("calendar:members")}</th>
          </tr>
        </thead>
        <tbody>
          {data.results.map((result, i) => (
            <tr key={i}>
              <td className="pl-4">
                <Placement placement={result.placement} />
              </td>
              <td>{result.teamName}</td>
              <td>
                <ul className="event__results-players">
                  {result.players.map((player) => (
                    <li
                      key={typeof player === "string" ? player : player.id}
                      className="flex items-center"
                    >
                      {typeof player === "string" ? (
                        player
                      ) : (
                        <Link
                          to={userPage(player)}
                          className="stack horizontal xs items-center"
                        >
                          <Avatar user={player} size="xxs" />{" "}
                          {discordFullName(player)}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

function MapPoolInfo() {
  const { t } = useTranslation(["calendar"]);
  const data = useLoaderData<typeof loader>();

  if (!data.mapPool) return null;

  return (
    <Section title={t("calendar:forms.mapPool")}>
      <div className="event__map-pool-section">
        <MapPoolStages mapPool={new MapPool(data.mapPool)} />
        <LinkButton
          className="event__create-map-list-link"
          to={readonlyMapsPage(data.event.eventId)}
          variant="outlined"
          tiny
        >
          <Image alt="" path={navIconUrl("maps")} width={22} height={22} />
          {t("calendar:createMapList")}
        </LinkButton>
      </div>
    </Section>
  );
}

function Description() {
  const { t } = useTranslation();
  const data = useLoaderData<typeof loader>();

  return (
    <Section title={t("forms.description")}>
      <div className="stack sm">
        <div className="event__author">
          <Avatar user={data.event} size="xs" />
          {discordFullName(data.event)}
        </div>
        {data.event.description && (
          <div className="whitespace-pre-wrap">{data.event.description}</div>
        )}
      </div>
    </Section>
  );
}

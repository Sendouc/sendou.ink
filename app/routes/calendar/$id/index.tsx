import {
  json,
  type MetaFunction,
  type LinksFunction,
  type LoaderArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { UseDataFunctionReturn } from "@remix-run/react/dist/components";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Avatar } from "~/components/Avatar";
import { LinkButton } from "~/components/Button";
import { Main } from "~/components/Main";
import { db } from "~/db";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useUser } from "~/modules/auth";
import { i18next } from "~/modules/i18n";
import {
  canEditCalendarEvent,
  canReportCalendarEventWinners,
} from "~/permissions";
import styles from "~/styles/calendar-event.css";
import { databaseTimestampToDate } from "~/utils/dates";
import { notFoundIfFalsy } from "~/utils/remix";
import { discordFullName, makeTitle } from "~/utils/strings";
import {
  calendarEditPage,
  calendarReportWinnersPage,
  resolveBaseUrl,
} from "~/utils/urls";
import { actualNumber, id } from "~/utils/zod";
import { Tags } from "../components/Tags";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = (args) => {
  const data = args.data as Nullable<UseDataFunctionReturn<typeof loader>>;

  if (!data) return {};

  return {
    title: data.title,
    description: data.event.description,
  };
};

export const handle = {
  i18n: "calendar",
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const t = await i18next.getFixedT(request);
  const parsedParams = z
    .object({ id: z.preprocess(actualNumber, id) })
    .parse(params);
  const event = notFoundIfFalsy(db.calendarEvents.findById(parsedParams.id));

  return json({
    event,
    badgePrizes: db.calendarEvents.findBadgesById(parsedParams.id),
    title: makeTitle([event.name, t("pages.calendar")]),
  });
};

export default function CalendarEventPage() {
  const user = useUser();
  const { event, badgePrizes } = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();
  const isMounted = useIsMounted();

  return (
    <Main className="stack lg">
      <section className="stack sm">
        <div className="event__times">
          {event.startTimes.map((startTime, i) => (
            <React.Fragment key={startTime}>
              <span
                className={clsx("event__day", {
                  hidden: event.startTimes.length === 1,
                })}
              >
                Day {i + 1}
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
                      }
                    )
                  : null}
              </time>
            </React.Fragment>
          ))}
        </div>
        <div className="stack md">
          <div className="stack xs">
            <h2>{event.name}</h2>
            <Tags tags={event.tags} badges={badgePrizes} />
          </div>
          <div className="stack horizontal sm flex-wrap">
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
            <LinkButton
              to={event.bracketUrl}
              variant="outlined"
              tiny
              isExternal
            >
              {resolveBaseUrl(event.bracketUrl)}
            </LinkButton>
            {canEditCalendarEvent({ user, event }) && (
              <LinkButton
                tiny
                to={calendarEditPage(event.eventId)}
                data-cy="edit-button"
              >
                Edit
              </LinkButton>
            )}
            {canReportCalendarEventWinners({
              user,
              event,
              startTimes: event.startTimes,
            }) && (
              <LinkButton
                tiny
                to={calendarReportWinnersPage(event.eventId)}
                data-cy="edit-button"
              >
                Report winners
              </LinkButton>
            )}
          </div>
        </div>
      </section>
      <div className="stack sm">
        <div className="event__author">
          <Avatar
            discordAvatar={event.discordAvatar}
            discordId={event.discordId}
            size="xs"
          />
          {discordFullName(event)}
        </div>
        <div data-cy="event-description">{event.description}</div>
      </div>
    </Main>
  );
}

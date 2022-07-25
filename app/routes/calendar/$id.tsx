import { json, type LinksFunction, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { LinkButton } from "~/components/Button";
import { Main } from "~/components/Main";
import { db } from "~/db";
import { useIsMounted } from "~/hooks/useIsMounted";
import { databaseTimestampToDate } from "~/utils/dates";
import { notFoundIfFalsy } from "~/utils/remix";
import { resolveBaseUrl } from "~/utils/urls";
import { actualNumber, id } from "~/utils/zod";
import styles from "~/styles/calendar-event.css";
import { Avatar } from "~/components/Avatar";
import { discordFullName } from "~/utils/strings";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = ({ params }: LoaderArgs) => {
  const parsedParams = z
    .object({ id: z.preprocess(actualNumber, id) })
    .parse(params);
  const event = notFoundIfFalsy(db.calendar.findById(parsedParams.id));

  return json({
    event,
  });
};

export default function CalendarEventPage() {
  const { event } = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();
  const isMounted = useIsMounted();

  // xxx: not taking in account many dates

  return (
    <Main className="stack lg">
      <section className="stack sm">
        <div className="event__time">
          <time
            dateTime={databaseTimestampToDate(event.startTime).toISOString()}
          >
            {isMounted
              ? databaseTimestampToDate(event.startTime).toLocaleDateString(
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
        </div>
        <h2 className="calendar__event__title">{event.name}</h2>
        {event.discordUrl || event.bracketUrl ? (
          <div className="stack horizontal sm">
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
      <div className="stack sm">
        <div className="event__author">
          <Avatar
            discordAvatar={event.discordAvatar}
            discordId={event.discordId}
            size="xs"
          />
          {discordFullName(event)}
        </div>
        <div>{event.description}</div>
      </div>
    </Main>
  );
}

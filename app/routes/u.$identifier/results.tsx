import { Link, useMatches } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import invariant from "tiny-invariant";
import { Avatar } from "~/components/Avatar";
import { Section } from "~/components/Section";
import { databaseTimestampToDate } from "~/utils/dates";
import { discordFullName, placementString } from "~/utils/strings";
import { calendarEventPage, userPage } from "~/utils/urls";
import type { UserPageLoaderData } from "../u.$identifier";

export default function UserResultsPage() {
  const { i18n } = useTranslation();
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const data = parentRoute.data as UserPageLoaderData;

  return (
    <Section className="u__results-section">
      <table>
        <thead>
          <tr>
            <th>Placing</th>
            <th>Team</th>
            <th>Tournament</th>
            <th>Date</th>
            <th>Mates</th>
          </tr>
        </thead>
        <tbody>
          {data.results.map((result) => (
            <tr key={result.eventId}>
              <td className="text-center">
                {placementString(result.placement)}
              </td>
              <td>{result.teamName}</td>
              <td>
                <Link to={calendarEventPage(result.eventId)}>
                  {result.eventName}
                </Link>
              </td>
              <td>
                {databaseTimestampToDate(result.startTime).toLocaleDateString(
                  i18n.language,
                  {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  }
                )}
              </td>
              <td>
                <ul className="u__results-players">
                  {result.mates.map((player) => (
                    <li key={typeof player === "string" ? player : player.id}>
                      {typeof player === "string" ? (
                        player
                      ) : (
                        <Link
                          to={userPage(player.discordId)}
                          className="stack horizontal xs items-center"
                        >
                          <Avatar
                            discordAvatar={player.discordAvatar}
                            discordId={player.discordId}
                            size="xxs"
                          />{" "}
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

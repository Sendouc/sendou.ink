import { Link, useMatches } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import invariant from "tiny-invariant";
import { Avatar } from "~/components/Avatar";
import { Placement } from "~/components/Placement";
import { Section } from "~/components/Section";
import { databaseTimestampToDate } from "~/utils/dates";
import { discordFullName } from "~/utils/strings";
import { calendarEventPage, userPage } from "~/utils/urls";
import type { UserPageLoaderData } from "../u.$identifier";

export default function UserResultsPage() {
  const { t, i18n } = useTranslation("user");
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const data = parentRoute.data as UserPageLoaderData;

  return (
    <main className="main layout__main">
      <Section className="u__results-section">
        <table>
          <thead>
            <tr>
              <th>{t("results.placing")}</th>
              <th>{t("results.team")}</th>
              <th>{t("results.tournament")}</th>
              <th>{t("results.participants")}</th>
              <th>{t("results.date")}</th>
              <th>{t("results.mates")}</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map((result) => (
              <tr key={result.eventId}>
                <td className="pl-4">
                  <Placement placement={result.placement} />
                </td>
                <td>{result.teamName}</td>
                <td>
                  <Link to={calendarEventPage(result.eventId)}>
                    {result.eventName}
                  </Link>
                </td>
                <td>{result.participantCount}</td>
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
    </main>
  );
}

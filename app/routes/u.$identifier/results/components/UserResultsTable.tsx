import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Avatar } from "~/components/Avatar";
import { Placement } from "~/components/Placement";
import { type UserPageLoaderData } from "~/routes/u.$identifier";
import { databaseTimestampToDate } from "~/utils/dates";
import { discordFullName } from "~/utils/strings";
import { calendarEventPage, userPage } from "~/utils/urls";

export type UserResultsTableProps = {
  results: UserPageLoaderData["results"];
  id: string;
  hasHighlightCheckboxes?: boolean;
};

export const HIGHLIGHT_CHECKBOX_NAME = "highlightTeamIds";

export function UserResultsTable({
  results,
  id,
  hasHighlightCheckboxes,
}: UserResultsTableProps) {
  const { t, i18n } = useTranslation("user");

  const placementHeaderId = `${id}-th-placement`;

  return (
    <table>
      <thead>
        <tr>
          {hasHighlightCheckboxes && <th />}
          <th id={placementHeaderId}>{t("results.placing")}</th>
          <th>{t("results.team")}</th>
          <th>{t("results.tournament")}</th>
          <th>{t("results.participants")}</th>
          <th>{t("results.date")}</th>
          <th>{t("results.mates")}</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result) => {
          // We are trying to construct a reasonable label for the checkbox
          // which shouldn't contain the whole information of the table row as
          // that can be also accessed when needed.
          // e.g. "20xx Placing 2nd", "Big House 10 Placing 20th"
          const placementCellId = `${id}-${result.teamId}-placement`;
          const nameCellId = `${id}-${result.teamId}-name`;
          const checkboxLabelIds = `${nameCellId} ${placementHeaderId} ${placementCellId}`;

          return (
            <tr key={result.teamId}>
              {hasHighlightCheckboxes && (
                <td>
                  <input
                    value={result.teamId}
                    aria-labelledby={checkboxLabelIds}
                    name={HIGHLIGHT_CHECKBOX_NAME}
                    type="checkbox"
                    defaultChecked={result.isHighlight}
                  />
                </td>
              )}
              <td className="pl-4" id={placementCellId}>
                <Placement placement={result.placement} />
              </td>
              <td>{result.teamName}</td>
              <td id={nameCellId}>
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
                          <Avatar user={player} size="xxs" />
                          {discordFullName(player)}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

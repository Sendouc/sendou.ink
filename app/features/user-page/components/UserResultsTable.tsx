import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Avatar } from "~/components/Avatar";
import { Placement } from "~/components/Placement";
import { type UserPageLoaderData } from "~/features/user-page/routes/u.$identifier";
import { databaseTimestampToDate } from "~/utils/dates";
import {
  calendarEventPage,
  tournamentBracketsPage,
  tournamentTeamPage,
  userPage,
} from "~/utils/urls";
import { Table } from "~/components/Table";

export type UserResultsTableProps = {
  results: UserPageLoaderData["results"];
  id: string;
  hasHighlightCheckboxes?: boolean;
};

export const HIGHLIGHT_CHECKBOX_NAME = "highlightTeamIds";
export const HIGHLIGHT_TOURNAMENT_CHECKBOX_NAME = "highlightTournamentTeamIds";

export function UserResultsTable({
  results,
  id,
  hasHighlightCheckboxes,
}: UserResultsTableProps) {
  const { t, i18n } = useTranslation("user");

  const placementHeaderId = `${id}-th-placement`;

  return (
    <Table>
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
        {results.map((result, i) => {
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
                    name={
                      result.tournamentId
                        ? HIGHLIGHT_TOURNAMENT_CHECKBOX_NAME
                        : HIGHLIGHT_CHECKBOX_NAME
                    }
                    type="checkbox"
                    defaultChecked={Boolean(result.isHighlight)}
                  />
                </td>
              )}
              <td className="pl-4" id={placementCellId}>
                <Placement placement={result.placement} />
              </td>
              <td>
                {result.tournamentId ? (
                  <Link
                    to={tournamentTeamPage({
                      tournamentId: result.tournamentId,
                      tournamentTeamId: result.teamId,
                    })}
                  >
                    {result.teamName}
                  </Link>
                ) : (
                  <>{result.teamName}</>
                )}
              </td>
              <td id={nameCellId}>
                {result.eventId ? (
                  <Link to={calendarEventPage(result.eventId)}>
                    {result.eventName}
                  </Link>
                ) : null}
                {result.tournamentId ? (
                  <Link
                    to={tournamentBracketsPage({
                      tournamentId: result.tournamentId,
                    })}
                    data-testid="tournament-name-cell"
                  >
                    {result.eventName}
                  </Link>
                ) : null}
              </td>
              <td>{result.participantCount}</td>
              <td>
                {/* TODO: can be made better when $narrowNotNull lands */}
                {databaseTimestampToDate(result.startTime!).toLocaleDateString(
                  i18n.language,
                  {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  },
                )}
              </td>
              <td>
                <ul
                  className="u__results-players"
                  data-testid={`mates-cell-placement-${i}`}
                >
                  {result.mates.map((player) => (
                    <li
                      key={player.name ? player.name : player.id}
                      className="flex items-center"
                    >
                      {player.name ? (
                        player.name
                      ) : (
                        // as any but we know it's a user since it doesn't have name
                        <Link
                          to={userPage(player as any)}
                          className="stack horizontal xs items-center"
                        >
                          <Avatar user={player as any} size="xxs" />
                          {player.username}
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
    </Table>
  );
}

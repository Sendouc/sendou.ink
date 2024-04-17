import type { Bracket as BracketType } from "../../core/Bracket";
import { RoundHeader } from "./RoundHeader";
import { Match } from "./Match";
import type { Match as MatchType } from "~/modules/brackets-model";
import { groupNumberToLetter } from "../../tournament-bracket-utils";
import { Button } from "~/components/Button";
import clsx from "clsx";
import {
  useBracketExpanded,
  useTournament,
} from "~/features/tournament/routes/to.$id";
import { useUser } from "~/features/auth/core/user";
import { SubmitButton } from "~/components/SubmitButton";
import { Link, useFetcher } from "@remix-run/react";
import { tournamentTeamPage } from "~/utils/urls";
import { logger } from "~/utils/logger";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { useSearchParamState } from "~/hooks/useSearchParamState";

export function SwissBracket({
  bracket,
  bracketIdx,
}: {
  bracket: BracketType;
  bracketIdx: number;
}) {
  const user = useUser();
  const tournament = useTournament();
  const { bracketExpanded } = useBracketExpanded();

  const groups = getGroups(bracket);
  const [selectedGroupId, setSelectedGroupId] = useSearchParamState({
    defaultValue: groups[0].groupId,
    name: "group",
    revive: (id) =>
      groups.find((g) => g.groupId === Number(id))
        ? Number(id)
        : groups[0].groupId,
  });
  const fetcher = useFetcher();

  const selectedGroup = groups.find((g) => g.groupId === selectedGroupId)!;

  const rounds = bracket.data.round.filter(
    (r) => r.group_id === selectedGroupId,
  );

  const someMatchOngoing = (matches: MatchType[]) =>
    matches.some(
      (match) =>
        match.opponent1 &&
        match.opponent2 &&
        match.opponent1.result !== "win" &&
        match.opponent2.result !== "win",
    );

  const allRoundsFinished = () => {
    for (const round of rounds) {
      const matches = bracket.data.match.filter(
        (match) =>
          match.round_id === round.id && match.group_id === selectedGroupId,
      );

      if (matches.length === 0 || someMatchOngoing(matches)) {
        return false;
      }
    }

    return true;
  };

  const roundThatCanBeStartedId = () => {
    if (!tournament.isOrganizer(user)) return undefined;

    for (const round of rounds) {
      const matches = bracket.data.match.filter(
        (match) =>
          match.round_id === round.id && match.group_id === selectedGroupId,
      );

      if (someMatchOngoing(matches) && matches.length > 0) {
        return undefined;
      }

      if (matches.length === 0) {
        return round.id;
      }
    }

    return;
  };

  return (
    <div className="stack xl">
      <div className="stack lg">
        {groups.length > 1 && (
          <div className="stack horizontal">
            {groups.map((g) => (
              <Button
                key={g.groupId}
                onClick={() => setSelectedGroupId(g.groupId)}
                className={clsx(
                  "tournament-bracket__bracket-nav__link tournament-bracket__bracket-nav__link__big",
                  {
                    "tournament-bracket__bracket-nav__link__selected":
                      selectedGroupId === g.groupId,
                  },
                )}
              >
                {g.groupName.split(" ")[1]}
              </Button>
            ))}
          </div>
        )}
        <div className="stack lg">
          {rounds.map((round, roundI) => {
            const matches = bracket.data.match.filter(
              (match) =>
                match.round_id === round.id &&
                match.group_id === selectedGroupId,
            );

            if (
              matches.length > 0 &&
              !bracketExpanded &&
              !someMatchOngoing(matches) &&
              roundI !== rounds.length - 1
            ) {
              return null;
            }

            const bestOf = round.maps?.count;

            const teamWithByeId = matches.find((m) => !m.opponent2)?.opponent1
              ?.id;
            const teamWithBye = teamWithByeId
              ? tournament.teamById(teamWithByeId)
              : null;

            return (
              <div
                key={round.id}
                className={matches.length > 0 ? "stack md-plus" : "stack"}
              >
                <div className="stack sm horizontal">
                  <RoundHeader
                    roundId={round.id}
                    name={`Round ${round.number}`}
                    bestOf={bestOf}
                    showInfos={someMatchOngoing(matches)}
                    maps={round.maps}
                  />
                  {roundThatCanBeStartedId() === round.id ? (
                    <fetcher.Form method="post">
                      <input
                        type="hidden"
                        name="groupId"
                        value={selectedGroupId}
                      />
                      <input
                        type="hidden"
                        name="bracketIdx"
                        value={bracketIdx}
                      />
                      <SubmitButton
                        _action="ADVANCE_BRACKET"
                        state={fetcher.state}
                      >
                        Start round
                      </SubmitButton>
                    </fetcher.Form>
                  ) : null}
                  {someMatchOngoing(matches) &&
                  tournament.isOrganizer(user) &&
                  roundI > 0 ? (
                    <FormWithConfirm
                      dialogHeading={`Delete all matches of round ${round.number}?`}
                      fields={[
                        ["groupId", selectedGroupId],
                        ["roundId", round.id],
                        ["bracketIdx", bracketIdx],
                        ["_action", "UNADVANCE_BRACKET"],
                      ]}
                    >
                      <Button
                        variant="minimal-destructive"
                        type="submit"
                        className="build__small-text mb-4"
                        size="tiny"
                      >
                        Reset round
                      </Button>
                    </FormWithConfirm>
                  ) : null}
                </div>
                <div className="stack horizontal md lg-row flex-wrap">
                  {matches.length === 0 ? (
                    <div className="text-lighter text-md font-bold">
                      Waiting for the previous round to finish
                    </div>
                  ) : null}
                  {matches.map((match) => {
                    if (!match.opponent1 || !match.opponent2) {
                      return null;
                    }

                    return (
                      <Match
                        key={match.id}
                        match={match}
                        roundNumber={round.number}
                        isPreview={bracket.preview}
                        showSimulation={false}
                        bracket={bracket}
                        type="groups"
                        group={selectedGroup.groupName.split(" ")[1]}
                      />
                    );
                  })}
                </div>
                {teamWithBye ? (
                  <div className="text-xs text-lighter font-semi-bold">
                    BYE: {teamWithBye.name}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <PlacementsTable
          bracket={bracket}
          groupId={selectedGroupId}
          allMatchesFinished={allRoundsFinished()}
        />
      </div>
    </div>
  );
}

function getGroups(bracket: BracketType) {
  const result: Array<{
    groupName: string;
    matches: MatchType[];
    groupId: number;
  }> = [];

  for (const group of bracket.data.group) {
    const matches = bracket.data.match.filter(
      (match) => match.group_id === group.id,
    );

    result.push({
      groupName: `Group ${groupNumberToLetter(group.number)}`,
      matches,
      groupId: group.id,
    });
  }

  return result;
}

function PlacementsTable({
  groupId,
  bracket,
  allMatchesFinished,
}: {
  groupId: number;
  bracket: BracketType;
  allMatchesFinished: boolean;
}) {
  const _standings = bracket
    .currentStandings(true)
    .filter((s) => s.groupId === groupId);

  const missingTeams = bracket.data.match.reduce((acc, cur) => {
    if (cur.group_id !== groupId) return acc;

    if (
      cur.opponent1?.id &&
      !_standings.some((s) => s.team.id === cur.opponent1!.id) &&
      !acc.includes(cur.opponent1.id)
    ) {
      acc.push(cur.opponent1.id);
    }

    if (
      cur.opponent2?.id &&
      !_standings.some((s) => s.team.id === cur.opponent2!.id) &&
      !acc.includes(cur.opponent2.id)
    ) {
      acc.push(cur.opponent2.id);
    }

    return acc;
  }, [] as number[]);

  const standings = _standings
    .concat(
      missingTeams.map((id) => ({
        team: bracket.tournament.teamById(id)!,
        stats: {
          mapLosses: 0,
          mapWins: 0,
          points: 0,
          setLosses: 0,
          setWins: 0,
          winsAgainstTied: 0,
        },
        placement: Math.max(..._standings.map((s) => s.placement)) + 1,
        groupId,
      })),
    )
    .sort((a, b) => {
      if (a.placement === b.placement && a.team.seed && b.team.seed) {
        return a.team.seed - b.team.seed;
      }

      return a.placement - b.placement;
    });

  const destinationBracket = (placement: number) =>
    bracket.tournament.brackets.find(
      (b) =>
        b.id !== bracket.id &&
        b.sources?.some(
          (s) => s.bracketIdx === 0 && s.placements.includes(placement),
        ),
    );

  return (
    <table className="rr__placements-table" cellSpacing={0}>
      <thead>
        <tr>
          <th>Team</th>
          <th>
            <abbr title="Set wins and losses">W/L</abbr>
          </th>
          <th>
            <abbr title="Wins against tied opponents">TB</abbr>
          </th>
          <th>
            <abbr title="Map wins and losses">W/L (M)</abbr>
          </th>
          <th>Seed</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {standings.map((s, i) => {
          const stats = s.stats!;
          if (!stats) {
            logger.error("No stats for team", s.team);
            return null;
          }

          const team = bracket.tournament.teamById(s.team.id);

          const dest = destinationBracket(i + 1);

          return (
            <tr key={s.team.id}>
              <td>
                <Link
                  to={tournamentTeamPage({
                    tournamentId: bracket.tournament.ctx.id,
                    tournamentTeamId: s.team.id,
                  })}
                >
                  {s.team.name}
                </Link>
              </td>
              <td>
                <span>
                  {stats.setWins}/{stats.setLosses}
                </span>
              </td>
              <td>
                <span>{stats.winsAgainstTied}</span>
              </td>
              <td>
                <span>
                  {stats.mapWins}/{stats.mapLosses}
                </span>
              </td>
              <td>{team?.seed}</td>
              {dest ? (
                <td
                  className={clsx({
                    "italic text-lighter": !allMatchesFinished,
                  })}
                >
                  <span>→ {dest.name}</span>
                </td>
              ) : (
                <td />
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

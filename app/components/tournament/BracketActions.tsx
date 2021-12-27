import { useLoaderData, useMatches } from "remix";
import invariant from "tiny-invariant";
import type {
  BracketModified,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import { useUser } from "~/utils/hooks";
import { ActionSectionWrapper } from "./ActionSectionWrapper";

// 2) set up UI
// - 1) Add *fc* 2) Host/join room with pass XXXX 3) Done

// 3) report score
// - Show map played
// - Select players who played with radio boxes if team.length > min_roster_length
// - Report

export function BracketActions() {
  const data = useLoaderData<BracketModified>();
  const user = useUser();
  const [, parentRoute] = useMatches();
  const { teams } = parentRoute.data as FindTournamentByNameForUrlI;

  const ownTeam = teams.find((team) =>
    team.members.some(({ member }) => member.id === user?.id)
  );

  const tournamentIsOver = false;

  if (tournamentIsOver || !ownTeam) return null;

  const allMatches = [
    ...data.winners.flatMap((round, roundI) =>
      round.matches.map((match) => ({
        ...match,
        bestOf: round.bestOf,
        isFirstRound: roundI === 0,
      }))
    ),
    ...data.losers.flatMap((round) =>
      round.matches.map((match) => ({
        ...match,
        bestOf: round.bestOf,
        isFirstRound: false,
      }))
    ),
  ];
  const currentMatch = allMatches.find((match) => {
    const hasBothParticipants = match.participants?.length === 2;
    const isOwnMatch = match.participants?.some((p) => p === ownTeam.name);

    const higherCount = match.score
      ? Math.max(match.score[0], match.score[1])
      : 0;
    const isNotOver = higherCount > match.bestOf / 2;

    return hasBothParticipants && isOwnMatch && isNotOver;
  });

  if (currentMatch) {
    return <ActionSectionWrapper>current match stuff</ActionSectionWrapper>;
  }

  const nextMatch = allMatches.find((match) => {
    return (
      match.participants?.reduce(
        (acc, cur) => acc + (cur === null ? 1 : 0),
        0
      ) === 1 &&
      match.participants.some((p) => p === ownTeam.name) &&
      !match.isFirstRound
    );
  });

  invariant(nextMatch, "nextMatch is undefined");
  const matchWeAreWaitingFor = allMatches.find(
    (match) =>
      [match.winnerDestinationMatchId, match.loserDestinationMatchId].includes(
        nextMatch.id
      ) && !match.participants?.includes(ownTeam.name)
  );
  invariant(matchWeAreWaitingFor, "matchWeAreWaitingFor is undefined");

  if (matchWeAreWaitingFor.participants?.length !== 2) {
    return (
      <ActionSectionWrapper>
        Waiting on match number {matchWeAreWaitingFor.number} (missing teams)
      </ActionSectionWrapper>
    );
  }

  return (
    <ActionSectionWrapper>
      Waiting on <b>{matchWeAreWaitingFor.participants[0]}</b> vs.
      <b>{matchWeAreWaitingFor.participants[1]}</b>
      <i>
        {(matchWeAreWaitingFor.score ?? [0, 0]).join("-")} - Best of{" "}
        {matchWeAreWaitingFor.bestOf}
      </i>
    </ActionSectionWrapper>
  );
}

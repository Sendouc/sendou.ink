import { useMatches } from "remix";
import invariant from "tiny-invariant";
import { matchIsOver } from "~/core/tournament/utils";
import type { BracketModified } from "~/services/bracket";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { useUser } from "~/utils/hooks";
import { ActionSectionWrapper } from "./ActionSectionWrapper";
import { DuringMatchActions } from "./DuringMatchActions";

export function BracketActions({ data }: { data: BracketModified }) {
  const user = useUser();
  const [, parentRoute] = useMatches();
  const { teams } = parentRoute.data as FindTournamentByNameForUrlI;

  const ownTeam = teams.find((team) =>
    team.members.some(({ member }) => member.id === user?.id)
  );

  const tournamentIsOver = false;

  if (tournamentIsOver || !ownTeam) return null;

  const allMatches = data.rounds.flatMap((round, roundI) =>
    round.matches.map((match) => ({
      ...match,
      round,
      isFirstRound: roundI === 0,
    }))
  );
  const currentMatch = allMatches.find((match) => {
    const hasBothParticipants = match.participants?.every(
      (p) => typeof p === "string"
    );
    const isOwnMatch = match.participants?.some((p) => p === ownTeam.name);

    return (
      hasBothParticipants &&
      isOwnMatch &&
      !matchIsOver(match.round.stages.length, match.score)
    );
  });

  if (currentMatch) {
    return (
      <DuringMatchActions
        ownTeam={ownTeam}
        currentMatch={currentMatch}
        currentRound={currentMatch.round}
      />
    );
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

  if (matchWeAreWaitingFor.participants?.filter(Boolean).length !== 2) {
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
        {matchWeAreWaitingFor.round.stages.length}
      </i>
    </ActionSectionWrapper>
  );
}

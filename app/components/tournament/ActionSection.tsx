import { useLoaderData } from "remix";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { useUser } from "~/utils/hooks";
import { ActionSectionBeforeStartContent } from "./ActionSectionBeforeStartContent";

// TODO: warning when not registered but check in is open
// TODO: rename, refactor
export function ActionSection() {
  const tournament = useLoaderData<FindTournamentByNameForUrlI>();
  const user = useUser();

  const ownTeam = tournament.teams.find((team) =>
    team.members.some(
      ({ member, captain }) => captain && member.id === user?.id
    )
  );

  const tournamentHasStarted = tournament.brackets.some((b) => b.rounds.length);
  if (!ownTeam || tournamentHasStarted) {
    return null;
  }

  return <ActionSectionBeforeStartContent ownTeam={ownTeam} />;
}

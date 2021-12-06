import { useLoaderData } from "remix";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { useUser } from "~/utils/hooks";
import { ActionSectionBeforeStartContent } from "./ActionSectionBeforeStartContent";

// TODO: warning when not registered but check in is open
export function ActionSection() {
  const tournament = useLoaderData<FindTournamentByNameForUrlI>();
  const user = useUser();

  const ownTeam = tournament.teams.find((team) =>
    team.members.some(
      ({ member, captain }) => captain && member.id === user?.id
    )
  );

  if (!ownTeam) {
    return null;
  }

  // TODO:
  const tournamentStatus = "not-started"; // "ongoing" | "concluded"

  if (tournamentStatus === "not-started") {
    return <ActionSectionBeforeStartContent ownTeam={ownTeam} />;
  }

  return null;
}

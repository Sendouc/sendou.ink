import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { useUser } from "~/utils/hooks";
import { AlertIcon } from "../icons/Alert";

export function ActionSection({
  tournament,
}: {
  tournament: FindTournamentByNameForUrlI;
}) {
  const user = useUser();

  const ownTeam = tournament.teams.find((team) =>
    team.members.some(
      ({ member, captain }) => captain && member.id === user?.id
    )
  );

  // TODO: or tournament is over
  if (!ownTeam) {
    return null;
  }

  const checkInHasStarted = new Date(tournament.checkInTime) < new Date();
  const teamHasEnoughMembers = true;
  // const teamHasEnoughMembers =
  //   ownTeam.members.length >= TOURNAMENT_TEAM_ROSTER_MIN_SIZE;

  if (!checkInHasStarted && !teamHasEnoughMembers) {
    return (
      <Wrapper icon="warning">
        <AlertIcon /> You need at least 4 players in your roster to play
      </Wrapper>
    );
  }

  const differenceInMinutesBetweenCheckInAndStart = Math.floor(
    (new Date(tournament.startTime).getTime() -
      new Date(tournament.checkInTime).getTime()) /
      (1000 * 60)
  );

  if (!checkInHasStarted && teamHasEnoughMembers) {
    return (
      <Wrapper icon="info">
        <AlertIcon /> Check-in starts{" "}
        {differenceInMinutesBetweenCheckInAndStart} minutes before the
        tournament starts
      </Wrapper>
    );
  }

  console.error("Unexpected combination in ActionSection component");
  return null;
}

function Wrapper({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: "warning" | "info";
}) {
  return (
    <section
      className="tournament__action-section"
      style={{ "--action-section-icon-color": `var(--theme-${icon})` } as any}
    >
      <div className="tournament__action-section__content">{children}</div>
    </section>
  );
}

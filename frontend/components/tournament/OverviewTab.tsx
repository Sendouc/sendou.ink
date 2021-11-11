import { useTournamentData } from "hooks/data/useTournamentData";

export function OverviewTab() {
  const { data } = useTournamentData();

  // TODO: handle loading
  // TODO: handle error in parent
  if (!data?.tournamentByIdentifier) return null;

  return <div>{data.tournamentByIdentifier.description}</div>;
}

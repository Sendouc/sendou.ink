import { useMatches } from "remix";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";

export default function DefaultTab() {
  const [, parentRoute] = useMatches();
  const { description } = parentRoute.data as FindTournamentByNameForUrlI;

  return <article style={{ whiteSpace: "pre-line" }}>{description}</article>;
}

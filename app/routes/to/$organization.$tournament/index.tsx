import { useMatches } from "remix";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";

export default function DefaultTab() {
  const [, parentRoute] = useMatches();
  const { description } = parentRoute.data as FindTournamentByNameForUrlI;

  // TODO: margin on mobile
  return <article style={{ whiteSpace: "pre-line" }}>{description}</article>;
}

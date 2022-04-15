import { useMatches } from "@remix-run/react";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";

export default function DefaultTab() {
  const [, parentRoute] = useMatches();
  const { description } = parentRoute.data as FindTournamentByNameForUrlI;

  return <article>{description}</article>;
}

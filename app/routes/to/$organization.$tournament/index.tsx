import { useMatches } from "@remix-run/react";
import { InfoBanner } from "~/components/tournament/InfoBanner";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";

export default function DefaultTab() {
  const [, parentRoute] = useMatches();
  const { description } = parentRoute.data as FindTournamentByNameForUrlI;

  return (
    <div>
      <InfoBanner />
      <article className="mt-4">{description}</article>
    </div>
  );
}

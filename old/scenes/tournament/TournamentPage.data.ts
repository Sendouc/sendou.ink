import { createResource } from "solid-js";
import { trpcClient } from "../../utils/trpc-client";

export default function TournamentData({
  params,
}: {
  params: { organization: string; tournament: string };
}) {
  return createResource(
    () => [params.organization, params.tournament],
    ([organization, tournament]) =>
      trpcClient.query("tournament.get", {
        organization,
        tournament,
      })
  );
}

export type ITournamentData = ReturnType<typeof TournamentData>;

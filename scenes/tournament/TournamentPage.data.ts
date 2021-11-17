import { useData } from "solid-app-router";
import { createResource } from "solid-js";
import { InferQueryOutput, trpcClient } from "../../utils/trpc-client";
import type { UseDataResult } from "../../utils/types";

export default function TournamentData({
  params,
}: {
  params: { organization: string; tournament: string };
}) {
  const [user] = createResource(
    () => [params.organization, params.tournament],
    ([organization, tournament]) =>
      trpcClient.query("tournament.get", {
        organization,
        tournament,
      })
  );

  return user;
}

export function useTournamentData(delta?: number) {
  return useData<UseDataResult<InferQueryOutput<"tournament.get">>>(delta);
}

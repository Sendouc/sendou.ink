import { useData } from "solid-app-router";
import { createResource } from "solid-js";
import { InferQueryOutput, trpcClient } from "../../../utils/trpc-client";

export default function TournamentData({
  params,
}: {
  params: { identifier: string };
}) {
  const [user] = createResource(
    () => params.identifier,
    (identifier: string) => trpcClient.query("tournament.get", identifier)
  );

  return user;
}

export const useTournamentData = () =>
  useData<() => InferQueryOutput<"tournament.get">>();

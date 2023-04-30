import type { LoaderArgs } from "@remix-run/node";
import { findMatchById } from "../queries/findMatchById.server";
import { matchIdFromParams } from "../tournament-utils";
import { useLoaderData } from "@remix-run/react";

export const loader = ({ params }: LoaderArgs) => {
  const matchId = matchIdFromParams(params);

  return {
    match: findMatchById(matchId),
  };
};

export default function TournamentMatchPage() {
  const data = useLoaderData<typeof loader>();

  console.log({ data });
  return <div>hello</div>;
}

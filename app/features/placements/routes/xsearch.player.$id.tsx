import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import { notFoundIfFalsy } from "~/utils/remix";
import { PlacementsTable } from "../components/Placements";
import { findPlacementsByPlayerId } from "../queries/findPlacements.server";
import styles from "../placements.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = ({ params }: LoaderArgs) => {
  const placements = notFoundIfFalsy(
    findPlacementsByPlayerId(Number(params["id"]))
  );

  return { placements };
};

export default function XSearchPlayerPage() {
  const data = useLoaderData<typeof loader>();

  // xxx: add player aliases
  // xxx: make placements table link to months results
  // xxx: takoroka/tentatek
  // xxx: link to user page, how?
  return (
    <Main halfWidth className="stack lg">
      <h2 className="text-lg">{data.placements[0]!.name}&apos;s placements</h2>
      <PlacementsTable placements={data.placements} type="MODE_INFO" />
    </Main>
  );
}

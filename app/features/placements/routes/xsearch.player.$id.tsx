import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import { notFoundIfFalsy } from "~/utils/remix";
import { PlacementsTable } from "../components/Placements";
import { findPlacementsByPlayerId } from "../queries/findPlacements.server";
import styles from "../placements.css";
import { removeDuplicates } from "~/utils/arrays";

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

  const firstName = data.placements[0]!.name;
  const aliases = removeDuplicates(
    data.placements
      .map((placement) => placement.name)
      .filter((name) => name !== firstName)
  );

  // xxx: make placements table link to months results
  // xxx: link to user page, how?
  return (
    <Main halfWidth className="stack lg">
      <div>
        <h2 className="text-lg">{firstName}&apos;s placements</h2>
        {aliases.length > 0 ? (
          <div className="text-lighter text-sm">
            Aliases: {aliases.join(", ")}
          </div>
        ) : null}
      </div>
      <PlacementsTable placements={data.placements} type="MODE_INFO" />
    </Main>
  );
}

import type { LinksFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import { findPlacements } from "../queries/findPlacements.server";
import styles from "../placements.css";
import { PlacementsTable } from "../components/Placements";

export const loader = () => {
  const placements = findPlacements({
    type: "XRANK",
    mode: "SZ",
    month: 3,
    year: 2023,
    region: "WEST",
  });

  return {
    placements,
  };
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function XSearchPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Main halfWidth>
      <PlacementsTable placements={data.placements} />
    </Main>
  );
}

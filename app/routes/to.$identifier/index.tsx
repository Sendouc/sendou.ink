import { useMatches, useOutletContext } from "@remix-run/react";
import { TournamentLoaderData } from "../to.$identifier";
import { InfoBanner } from "./components/InfoBanner";

export default function DefaultTab() {
  const data = useOutletContext<TournamentLoaderData>();

  return (
    <div>
      <InfoBanner data={data} />
      <article className="mt-4">{data.description}</article>
    </div>
  );
}

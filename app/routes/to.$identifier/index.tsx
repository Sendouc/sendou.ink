import { useOutletContext } from "@remix-run/react";
import type { TournamentLoaderData } from "../to.$identifier";
import { InfoBanner } from "./components/InfoBanner";

export default function DefaultTab() {
  const data = useOutletContext<TournamentLoaderData>();

  return (
    <>
      <InfoBanner data={data} />
      <article className="mt-4">{data.description}</article>
    </>
  );
}

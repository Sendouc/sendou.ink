import { useOutletContext } from "@remix-run/react";
import type { TournamentLoaderData } from "../to.$identifier";

export default function DefaultTab() {
  const data = useOutletContext<TournamentLoaderData>();

  return (
    <>
      <article>{data.description}</article>
    </>
  );
}

import type { LinksFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import { VodListing } from "../components/VodListing";
import { findVods } from "../queries/findVods";
import styles from "../vods.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = () => {
  const vods = findVods({ limit: 25 });

  return { vods };
};

export default function VodsSearchPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Main>
      <div className="vods__listing__list">
        {data.vods.map((vod) => (
          <VodListing key={vod.id} vod={vod} />
        ))}
      </div>
    </Main>
  );
}

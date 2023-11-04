import type { LinksFunction } from "@remix-run/node";
import { useMatches } from "@remix-run/react";
import invariant from "tiny-invariant";
import { VodListing } from "~/features/vods";
import type { SendouRouteHandle } from "~/utils/remix";
import styles from "~/features/vods/vods.css";
import type { UserPageLoaderData } from "./u.$identifier";

export const handle: SendouRouteHandle = {
  i18n: ["vods"],
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function UserVodsPage() {
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const userPageData = parentRoute.data as UserPageLoaderData;

  return (
    <div className="vods__listing__list">
      {userPageData.vods.map((vod) => (
        <VodListing key={vod.id} vod={vod} showUser={false} />
      ))}
    </div>
  );
}

import { useMatches } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { SendouRouteHandle } from "~/utils/remix";
import "~/features/vods/vods.css";
import type { UserPageLoaderData } from "./u.$identifier";
import { VodListing } from "~/features/vods/components/VodListing";

export const handle: SendouRouteHandle = {
  i18n: ["vods"],
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

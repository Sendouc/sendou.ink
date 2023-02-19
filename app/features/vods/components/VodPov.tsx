import { Link } from "@remix-run/react";
import { Avatar } from "~/components/Avatar";
import { discordFullName } from "~/utils/strings";
import { userPage } from "~/utils/urls";
import type { Vod } from "../vods-types";

export function PovUser({ pov }: { pov: Vod["pov"] }) {
  if (!pov) return null;

  if (typeof pov === "string") {
    return <div className="text-sm">{pov}</div>;
  }

  return (
    <Link to={userPage(pov)} className="stack horizontal xs">
      <Avatar user={pov} size="xxs" />
      <span className="text-sm font-semi-bold">{discordFullName(pov)}</span>
    </Link>
  );
}

import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useMatches, useParams } from "@remix-run/react";
import clsx from "clsx";
import { Redirect } from "~/components/Redirect";
import { db } from "~/db";
import type { OwnersByBadge } from "~/db/models/badges.server";
import type { Badge } from "~/db/types";
import { jsonCached } from "~/utils/remix";
import { discordFullName } from "~/utils/strings";
import { BADGES_PAGE, badgeUrl } from "~/utils/urls";
import type { BadgesLoaderData } from "../badges";

export interface BadgeDetailsLoaderData {
  owners: OwnersByBadge;
}

export const loader: LoaderFunction = ({ params }) => {
  const badgeId = Number(params["id"]);
  if (Number.isNaN(badgeId)) {
    throw new Response(null, { status: 404 });
  }

  return jsonCached<BadgeDetailsLoaderData>(
    { owners: db.badges.ownersByBadgeId(badgeId) },
    120
  );
};

export default function BadgeDetailsPage() {
  const [, parentRoute] = useMatches();
  const { badges } = parentRoute!.data as BadgesLoaderData;
  const params = useParams();
  const data = useLoaderData<BadgeDetailsLoaderData>();

  const badge = badges.find((b) => b.id === Number(params["id"]));
  if (!badge) return <Redirect to={BADGES_PAGE} />;

  return (
    <div className="stack md items-center">
      <img
        src={badgeUrl({ code: badge.code, extension: "gif" })}
        alt={badge.displayName}
        title={badge.displayName}
        width="200"
        height="200"
      />
      <div className="badges__explanation">{badgeExplanationText(badge)}</div>
      <div className="badges__owners-container">
        <ul className="badges__owners">
          {data.owners.map((owner) => (
            <li key={owner.id}>
              <span
                className={clsx("badges__count", {
                  invisible: owner.count <= 1,
                })}
              >
                ×{owner.count}
              </span>
              <span>{discordFullName(owner)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function badgeExplanationText(
  badge: Pick<Badge, "displayName" | "code"> & { count?: number }
) {
  const countString =
    badge.count && badge.count > 1 ? ` (x${badge.count})` : "";
  return `Awarded for winning ${badge.displayName}${countString}`;
}

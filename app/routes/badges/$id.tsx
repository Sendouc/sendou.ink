import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData, useMatches, useParams } from "@remix-run/react";
import clsx from "clsx";
import { Badge } from "~/components/Badge";
import { LinkButton } from "~/components/Button";
import { Redirect } from "~/components/Redirect";
import { db } from "~/db";
import type {
  ManagersByBadgeId,
  OwnersByBadgeId,
} from "~/db/models/badges.server";
import type { Badge as BadgeDBType } from "~/db/types";
import { useUser } from "~/modules/auth";
import { canEditBadgeOwners } from "~/permissions";
import { discordFullName } from "~/utils/strings";
import { BADGES_PAGE } from "~/utils/urls";
import type { BadgesLoaderData } from "../badges";

export interface BadgeDetailsContext {
  badgeName: string;
}

export interface BadgeDetailsLoaderData {
  owners: OwnersByBadgeId;
  managers: ManagersByBadgeId;
}

export const loader: LoaderFunction = ({ params }) => {
  const badgeId = Number(params["id"]);
  if (Number.isNaN(badgeId)) {
    throw new Response(null, { status: 404 });
  }

  return json<BadgeDetailsLoaderData>({
    owners: db.badges.ownersByBadgeId(badgeId),
    managers: db.badges.managersByBadgeId(badgeId),
  });
};

export default function BadgeDetailsPage() {
  const user = useUser();
  const [, parentRoute] = useMatches();
  const { badges } = parentRoute!.data as BadgesLoaderData;
  const params = useParams();
  const data = useLoaderData<BadgeDetailsLoaderData>();

  const badge = badges.find((b) => b.id === Number(params["id"]));
  if (!badge) return <Redirect to={BADGES_PAGE} />;

  const context: BadgeDetailsContext = { badgeName: badge.displayName };

  return (
    <div className="stack md items-center">
      <Outlet context={context} />
      <Badge badge={badge} isAnimated size={200} />
      <div className="badges__explanation">{badgeExplanationText(badge)}</div>
      {canEditBadgeOwners({ user, managers: data.managers }) ? (
        <LinkButton to="edit" variant="outlined" tiny data-cy="edit-button">
          Edit
        </LinkButton>
      ) : null}
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
  badge: Pick<BadgeDBType, "displayName" | "code"> & { count?: number }
) {
  const countString =
    badge.count && badge.count > 1 ? ` (x${badge.count})` : "";
  return `Awarded for winning ${badge.displayName}${countString}`;
}

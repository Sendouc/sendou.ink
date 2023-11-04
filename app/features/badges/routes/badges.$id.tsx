import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
import { Outlet, useLoaderData, useMatches, useParams } from "@remix-run/react";
import clsx from "clsx";
import { Badge } from "~/components/Badge";
import { LinkButton } from "~/components/Button";
import { Redirect } from "~/components/Redirect";
import { type Badge as BadgeDBType } from "~/db/types";
import { useUser } from "~/features/auth/core";
import { canEditBadgeOwners, isMod } from "~/permissions";
import { BADGES_PAGE } from "~/utils/urls";
import { type BadgesLoaderData } from "./badges";
import { type TFunction } from "i18next";
import { useTranslation } from "~/hooks/useTranslation";
import { SPLATOON_3_XP_BADGE_VALUES } from "~/constants";
import * as BadgeRepository from "../BadgeRepository.server";

export interface BadgeDetailsContext {
  badgeName: string;
}

export type BadgeDetailsLoaderData = SerializeFrom<typeof loader>;
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const badgeId = Number(params["id"]);
  if (Number.isNaN(badgeId)) {
    throw new Response(null, { status: 404 });
  }

  return {
    owners: await BadgeRepository.findOwnersByBadgeId(badgeId),
    managers: await BadgeRepository.findManagersByBadgeId(badgeId),
  };
};

export default function BadgeDetailsPage() {
  const user = useUser();
  const [, parentRoute] = useMatches();
  const { badges } = parentRoute.data as BadgesLoaderData;
  const params = useParams();
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation("badges");

  const badge = badges.find((b) => b.id === Number(params["id"]));
  if (!badge) return <Redirect to={BADGES_PAGE} />;

  const context: BadgeDetailsContext = { badgeName: badge.displayName };

  return (
    <div className="stack md items-center">
      <Outlet context={context} />
      <Badge badge={badge} isAnimated size={200} />
      <div>
        <div className="badges__explanation">
          {badgeExplanationText(t, badge)}
        </div>
        <div
          className={clsx("badges__managers", {
            invisible: data.managers.length === 0,
          })}
        >
          {t("managedBy", {
            users: data.managers.map((m) => m.discordName).join(", "),
          })}
        </div>
      </div>
      {isMod(user) || canEditBadgeOwners({ user, managers: data.managers }) ? (
        <LinkButton to="edit" variant="outlined" size="tiny">
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
              <span>{owner.discordName}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function badgeExplanationText(
  t: TFunction<"badges", undefined>,
  badge: Pick<BadgeDBType, "displayName" | "code"> & { count?: number },
) {
  if (badge.code === "patreon") return t("patreon");
  if (badge.code === "patreon_plus") {
    return t("patreon+");
  }
  if (
    badge.code.startsWith("xp") ||
    SPLATOON_3_XP_BADGE_VALUES.includes(Number(badge.code) as any)
  ) {
    return t("xp", { xpText: badge.displayName });
  }

  return t("tournament", {
    count: badge.count ?? 1,
    tournament: badge.displayName,
  }).replace("&#39;", "'");
}

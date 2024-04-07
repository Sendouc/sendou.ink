import { useLoaderData, useMatches } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { BuildCard } from "~/components/BuildCard";
import { Button, LinkButton } from "~/components/Button";
import { WeaponImage } from "~/components/Image";
import { BUILD } from "~/constants";
import { useUser } from "~/features/auth/core/user";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { mainWeaponIds } from "~/modules/in-game-lists";
import { atOrError } from "~/utils/arrays";
import { type SendouRouteHandle } from "~/utils/remix";
import { userNewBuildPage } from "~/utils/urls";
import { type UserPageLoaderData } from "./u.$identifier";

import { loader } from "../loaders/u.$identifier.builds.server";
import { action } from "../actions/u.$identifier.builds.server";
export { loader, action };

export const handle: SendouRouteHandle = {
  i18n: ["weapons", "builds", "gear"],
};

export default function UserBuildsPage() {
  const { t } = useTranslation("builds");
  const user = useUser();
  const parentPageData = atOrError(useMatches(), -2).data as UserPageLoaderData;
  const data = useLoaderData<typeof loader>();
  const [weaponFilter, setWeaponFilter] = useSearchParamState<
    "ALL" | MainWeaponId
  >({
    defaultValue: "ALL",
    name: "weapon",
    revive: (value) =>
      value === "ALL"
        ? value
        : mainWeaponIds.find((id) => id === Number(value)),
  });

  const isOwnPage = user?.id === parentPageData.id;

  const builds =
    weaponFilter === "ALL"
      ? data.builds
      : data.builds.filter((build) =>
          build.weapons.map((wpn) => wpn.weaponSplId).includes(weaponFilter),
        );

  return (
    <div className="stack lg">
      {isOwnPage && (
        <div className="stack sm horizontal items-center justify-end">
          {data.builds.length < BUILD.MAX_COUNT ? (
            <LinkButton
              to={userNewBuildPage(parentPageData)}
              size="tiny"
              testId="new-build-button"
            >
              {t("addBuild")}
            </LinkButton>
          ) : (
            <>
              <span className="info-message">{t("reachBuildMaxCount")}</span>
              <button className="tiny" disabled>
                {t("addBuild")}
              </button>
            </>
          )}
        </div>
      )}
      <WeaponFilters
        weaponFilter={weaponFilter}
        setWeaponFilter={setWeaponFilter}
      />
      {builds.length > 0 ? (
        <div className="builds-container">
          {builds.map((build) => (
            <BuildCard key={build.id} build={build} canEdit={isOwnPage} />
          ))}
        </div>
      ) : (
        <div className="text-center text-lg text-lighter font-semi-bold">
          {t("noBuilds")}
        </div>
      )}
    </div>
  );
}

function WeaponFilters({
  weaponFilter,
  setWeaponFilter,
}: {
  weaponFilter: "ALL" | MainWeaponId;
  setWeaponFilter: (weaponFilter: "ALL" | MainWeaponId) => void;
}) {
  const { t } = useTranslation(["weapons", "builds"]);
  const data = useLoaderData<typeof loader>();

  if (data.builds.length === 0) return null;

  return (
    <div className="stack horizontal sm flex-wrap">
      <Button
        onClick={() => setWeaponFilter("ALL")}
        variant={weaponFilter === "ALL" ? undefined : "outlined"}
        size="tiny"
        className="u__build-filter-button"
      >
        {t("builds:stats.all")} ({data.builds.length})
      </Button>
      {mainWeaponIds.map((weaponId) => {
        const count = data.weaponCounts[weaponId];

        if (!count) return null;

        return (
          <Button
            key={weaponId}
            onClick={() => setWeaponFilter(weaponId)}
            variant={weaponFilter === weaponId ? undefined : "outlined"}
            size="tiny"
            className="u__build-filter-button"
          >
            <WeaponImage weaponSplId={weaponId} variant="build" width={20} />
            {t(`weapons:MAIN_${weaponId}`)} ({count})
          </Button>
        );
      })}
    </div>
  );
}

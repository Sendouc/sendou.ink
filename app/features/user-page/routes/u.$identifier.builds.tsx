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
import { LockIcon } from "~/components/icons/Lock";

import { loader } from "../loaders/u.$identifier.builds.server";
import { action } from "../actions/u.$identifier.builds.server";
export { loader, action };

export const handle: SendouRouteHandle = {
  i18n: ["weapons", "builds", "gear"],
};

type BuildFilter = "ALL" | "PUBLIC" | "PRIVATE" | MainWeaponId;

export default function UserBuildsPage() {
  const { t } = useTranslation("builds");
  const user = useUser();
  const parentPageData = atOrError(useMatches(), -2).data as UserPageLoaderData;
  const data = useLoaderData<typeof loader>();
  const [weaponFilter, setWeaponFilter] = useSearchParamState<BuildFilter>({
    defaultValue: "ALL",
    name: "weapon",
    revive: (value) =>
      ["ALL", "PUBLIC", "PRIVATE"].includes(value)
        ? (value as BuildFilter)
        : mainWeaponIds.find((id) => id === Number(value)),
  });

  const isOwnPage = user?.id === parentPageData.id;

  const builds =
    weaponFilter === "ALL"
      ? data.builds
      : weaponFilter === "PUBLIC"
        ? data.builds.filter((build) => !build.private)
        : weaponFilter === "PRIVATE"
          ? data.builds.filter((build) => build.private)
          : data.builds.filter((build) =>
              build.weapons
                .map((wpn) => wpn.weaponSplId)
                .includes(weaponFilter),
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
      <BuildsFilters
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

function BuildsFilters({
  weaponFilter,
  setWeaponFilter,
}: {
  weaponFilter: BuildFilter;
  setWeaponFilter: (weaponFilter: BuildFilter) => void;
}) {
  const { t } = useTranslation(["weapons", "builds"]);
  const data = useLoaderData<typeof loader>();
  const user = useUser();
  const parentPageData = atOrError(useMatches(), -2).data as UserPageLoaderData;

  if (data.builds.length === 0) return null;

  const privateBuildsCount = data.builds.filter(
    (build) => build.private,
  ).length;
  const publicBuildsCount = data.builds.length - privateBuildsCount;

  const showPublicPrivateFilters =
    user?.id === parentPageData.id && privateBuildsCount > 0;

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
      {showPublicPrivateFilters ? (
        <>
          <Button
            onClick={() => setWeaponFilter("PUBLIC")}
            variant={weaponFilter === "PUBLIC" ? undefined : "outlined"}
            size="tiny"
            className="u__build-filter-button"
          >
            {t("builds:stats.public")} ({publicBuildsCount})
          </Button>
          <Button
            onClick={() => setWeaponFilter("PRIVATE")}
            variant={weaponFilter === "PRIVATE" ? undefined : "outlined"}
            size="tiny"
            className="u__build-filter-button"
            icon={<LockIcon />}
          >
            {t("builds:stats.private")} ({privateBuildsCount})
          </Button>
        </>
      ) : null}

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

import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData, useMatches } from "@remix-run/react";
import { z } from "zod";
import { BuildCard } from "~/components/BuildCard";
import { Button, LinkButton } from "~/components/Button";
import { BUILD } from "~/constants";
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/modules/auth";
import { getUserId, requireUserId } from "~/modules/auth/user.server";
import { atOrError } from "~/utils/arrays";
import {
  notFoundIfFalsy,
  parseRequestFormData,
  privatelyCachedJson,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { userNewBuildPage } from "~/utils/urls";
import { actualNumber, id } from "~/utils/zod";
import { userParamsSchema, type UserPageLoaderData } from "../../u.$identifier";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { mainWeaponIds } from "~/modules/in-game-lists";
import { WeaponImage } from "~/components/Image";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import * as BuildRepository from "~/features/builds/BuildRepository.server";
import * as UserRepository from "~/features/user-page/UserRepository.server";

const buildsActionSchema = z.object({
  buildToDeleteId: z.preprocess(actualNumber, id),
});

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    request,
    schema: buildsActionSchema,
  });

  const usersBuilds = await BuildRepository.allByUserId({
    userId: user.id,
    showPrivate: true,
  });

  validate(usersBuilds.some((build) => build.id === data.buildToDeleteId));

  await BuildRepository.deleteById(data.buildToDeleteId);

  return null;
};

export const handle: SendouRouteHandle = {
  i18n: ["weapons", "builds", "gear"],
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const loggedInUser = await getUserId(request);
  const { identifier } = userParamsSchema.parse(params);
  const user = notFoundIfFalsy(
    await UserRepository.identifierToUserId(identifier),
  );

  const builds = await BuildRepository.allByUserId({
    userId: user.id,
    showPrivate: loggedInUser?.id === user.id,
  });

  if (builds.length === 0 && loggedInUser?.id !== user.id) {
    throw new Response(null, { status: 404 });
  }

  return privatelyCachedJson({
    builds,
    weaponCounts: calculateWeaponCounts(),
  });

  function calculateWeaponCounts() {
    return builds.reduce(
      (acc, build) => {
        for (const weapon of build.weapons) {
          acc[weapon.weaponSplId] = (acc[weapon.weaponSplId] ?? 0) + 1;
        }

        return acc;
      },
      {} as Record<MainWeaponId, number>,
    );
  }
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

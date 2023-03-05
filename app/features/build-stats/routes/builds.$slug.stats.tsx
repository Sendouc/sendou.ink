import type { LinksFunction, LoaderArgs, SerializeFrom } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import { weaponNameSlugToId } from "~/utils/unslugify.server";
import { averageAbilityPoints } from "../queries/averageAbilityPoints.server";
import { abilityPointCountsToAverages } from "../build-stats-utils";
import { Ability } from "~/components/Ability";
import styles from "../build-stats-styles.css";
import { WeaponImage } from "~/components/Image";
import type { SendouRouteHandle } from "~/utils/remix";
import { notFoundIfFalsy } from "~/utils/remix";
import { MAX_AP } from "~/constants";
import { useTranslation } from "~/hooks/useTranslation";
import {
  BUILDS_PAGE,
  navIconUrl,
  outlinedMainWeaponImageUrl,
  weaponBuildPage,
} from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["weapons", "builds", "analyzer"],
  breadcrumb: ({ match }) => {
    const data = match.data as SerializeFrom<typeof loader> | undefined;

    if (!data) return [];

    return [
      {
        imgPath: navIconUrl("builds"),
        href: BUILDS_PAGE,
        type: "IMAGE",
      },
      {
        imgPath: outlinedMainWeaponImageUrl(data.weaponId),
        href: weaponBuildPage(data.slug),
        type: "IMAGE",
      },
      {
        href: "/",
        text: "Stats",
        type: "TEXT",
      },
    ];
  },
};

export const loader = ({ params }: LoaderArgs) => {
  const weaponId = notFoundIfFalsy(weaponNameSlugToId(params["slug"]));

  return {
    stats: abilityPointCountsToAverages({
      allAbilities: averageAbilityPoints(),
      weaponAbilities: averageAbilityPoints(weaponId),
    }),
    weaponId,
    slug: params["slug"]!,
  };
};

export default function BuildStatsPage() {
  const { t } = useTranslation(["weapons", "builds", "analyzer"]);
  const data = useLoaderData<typeof loader>();

  return (
    <Main halfWidth className="stack lg">
      <div className="text-xs text-lighter font-bold">
        {t("builds:stats.count.title", {
          count: data.stats.weaponBuildsCount,
          weapon: t(`weapons:MAIN_${data.weaponId}`),
        })}
      </div>
      <div className="stack md">
        <h2 className="text-lg">{t("builds:stats.ap.title")}</h2>
        <div className="stack md">
          {data.stats.stackableAbilities.map((stats) => {
            const apToPx = (ap: number) =>
              Math.floor(
                (ap / data.stats.stackableAbilities[0]!.apAverage.weapon) * 200
              );

            return (
              <div key={stats.name} className="build-stats__ability-row">
                <Ability ability={stats.name} size="SUB" />
                <div className="build-stats__bars">
                  <div>
                    <WeaponImage
                      variant="badge"
                      weaponSplId={data.weaponId}
                      width={22}
                    />{" "}
                  </div>
                  <div>
                    {stats.apAverage.weapon} {t("analyzer:abilityPoints.short")}
                  </div>{" "}
                  <div
                    className="build-stats__bar"
                    style={{ width: `${apToPx(stats.apAverage.weapon)}px` }}
                  />
                  <div className="text-xs text-lighter font-bold justify-self-center">
                    {t("builds:stats.all")}
                  </div>
                  <div>
                    {stats.apAverage.all} {t("analyzer:abilityPoints.short")}
                  </div>{" "}
                  <div
                    className="build-stats__bar"
                    style={{ width: `${apToPx(stats.apAverage.all)}px` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="stack md">
        <h2 className="text-lg">{t("builds:stats.percentage.title")}</h2>
        <div className="stack md">
          {data.stats.mainOnlyAbilities.map((stats) => {
            const percentageToPx = (ap: number) =>
              Math.floor((ap / MAX_AP) * 125);

            return (
              <div key={stats.name} className="build-stats__ability-row">
                <Ability ability={stats.name} size="SUB" />
                <div className="build-stats__bars">
                  <div>
                    <WeaponImage
                      variant="badge"
                      weaponSplId={data.weaponId}
                      width={22}
                    />{" "}
                  </div>
                  <div>{stats.percentage.weapon}%</div>{" "}
                  <div
                    className="build-stats__bar"
                    style={{
                      width: `${percentageToPx(stats.percentage.weapon)}px`,
                    }}
                  />
                  <div className="text-xs text-lighter font-bold justify-self-center">
                    {t("builds:stats.all")}
                  </div>
                  <div>{stats.percentage.all}%</div>{" "}
                  <div
                    className="build-stats__bar"
                    style={{
                      width: `${percentageToPx(stats.percentage.all)}px`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Main>
  );
}

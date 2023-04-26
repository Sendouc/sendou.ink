import {
  type LoaderArgs,
  type V2_MetaFunction,
  type SerializeFrom,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "~/hooks/useTranslation";
import { BuildCard } from "~/components/BuildCard";
import { LinkButton } from "~/components/Button";
import {
  BUILDS_PAGE_BATCH_SIZE,
  BUILDS_PAGE_MAX_BUILDS,
  ONE_HOUR_IN_MS,
} from "~/constants";
import { db } from "~/db";
import { i18next } from "~/modules/i18n";
import { weaponIdIsNotAlt } from "~/modules/in-game-lists";
import { type SendouRouteHandle } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { weaponNameSlugToId } from "~/utils/unslugify.server";
import {
  BUILDS_PAGE,
  mySlugify,
  navIconUrl,
  outlinedMainWeaponImageUrl,
  weaponBuildPage,
} from "~/utils/urls";
import { Main } from "~/components/Main";
import { ChartBarIcon } from "~/components/icons/ChartBar";
import { FireIcon } from "~/components/icons/Fire";
import { cachified } from "cachified";
import { cache, ttl } from "~/utils/cache.server";

export const meta: V2_MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader> | null;

  if (!data) return [];

  return [{ title: data.title }];
};

export const handle: SendouRouteHandle = {
  i18n: ["weapons", "builds", "gear"],
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
    ];
  },
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const t = await i18next.getFixedT(request, ["weapons", "common"], {
    lng: "en",
  });
  const weaponId = weaponNameSlugToId(params["slug"]);

  if (typeof weaponId !== "number" || !weaponIdIsNotAlt(weaponId)) {
    throw new Response(null, { status: 404 });
  }

  const url = new URL(request.url);
  const limit = Math.min(
    Number(url.searchParams.get("limit") ?? BUILDS_PAGE_BATCH_SIZE),
    BUILDS_PAGE_MAX_BUILDS
  );

  const weaponName = t(`weapons:MAIN_${weaponId}`);

  const slug = mySlugify(t(`weapons:MAIN_${weaponId}`, { lng: "en" }));

  const cachedBuilds = await cachified({
    key: `builds-${weaponId}`,
    cache,
    ttl: ttl(ONE_HOUR_IN_MS),
    // eslint-disable-next-line @typescript-eslint/require-await
    async getFreshValue() {
      return db.builds.buildsByWeaponId({
        weaponId,
        limit: BUILDS_PAGE_MAX_BUILDS,
      });
    },
  });

  return {
    weaponId,
    weaponName,
    title: makeTitle([weaponName, t("common:pages.builds")]),
    builds: cachedBuilds.slice(0, limit),
    limit,
    slug,
  };
};

export default function WeaponsBuildsPage() {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation(["common", "builds"]);

  return (
    <Main className="stack lg">
      <div className="builds-buttons">
        <LinkButton
          to="stats"
          variant="outlined"
          icon={<ChartBarIcon />}
          size="tiny"
        >
          {t("builds:linkButton.abilityStats")}
        </LinkButton>
        <LinkButton
          to="popular"
          variant="outlined"
          icon={<FireIcon />}
          size="tiny"
        >
          {t("builds:linkButton.popularBuilds")}
        </LinkButton>
      </div>
      <div className="builds-container">
        {data.builds.map((build) => {
          return (
            <BuildCard
              key={build.id}
              build={build}
              owner={build}
              canEdit={false}
            />
          );
        })}
      </div>
      {data.limit < BUILDS_PAGE_MAX_BUILDS &&
        // not considering edge case where there are amount of builds equal to current limit
        // TODO: this could be fixed by taking example from the vods page
        data.builds.length === data.limit && (
          <LinkButton
            className="m-0-auto"
            size="tiny"
            to={`?limit=${data.limit + BUILDS_PAGE_BATCH_SIZE}`}
            state={{ scroll: false }}
          >
            {t("common:actions.loadMore")}
          </LinkButton>
        )}
    </Main>
  );
}

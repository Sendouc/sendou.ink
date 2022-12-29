import {
  type LoaderArgs,
  type MetaFunction,
  type SerializeFrom,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "~/hooks/useTranslation";
import { BuildCard } from "~/components/BuildCard";
import { LinkButton } from "~/components/Button";
import { BUILDS_PAGE_BATCH_SIZE, BUILDS_PAGE_MAX_BUILDS } from "~/constants";
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

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader> | null;

  if (!data) return {};

  return {
    title: data.title,
  };
};

export const handle: SendouRouteHandle = {
  i18n: ["weapons", "builds", "gear"],
  breadcrumb: ({ match }) => {
    const data = match.data as SerializeFrom<typeof loader>;

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

  return {
    weaponId,
    weaponName,
    title: makeTitle([weaponName, t("common:pages.builds")]),
    builds: db.builds.buildsByWeaponId({
      weaponId,
      limit,
    }),
    limit,
    slug,
  };
};

export default function WeaponsBuildsPage() {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation(["common"]);

  return (
    <Main className="stack lg">
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

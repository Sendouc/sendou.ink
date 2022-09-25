import {
  type MetaFunction,
  type LoaderArgs,
  type SerializeFrom,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { BuildCard } from "~/components/BuildCard";
import { LinkButton } from "~/components/Button";
import { BUILDS_PAGE_BATCH_SIZE, BUILDS_PAGE_MAX_BUILDS } from "~/constants";
import { db } from "~/db";
import { i18next } from "~/modules/i18n";
import { mainWeaponIds, weaponIdIsNotAlt } from "~/modules/in-game-lists";
import { makeTitle } from "~/utils/strings";
import { mySlugify } from "~/utils/urls";

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader> | null;

  if (!data) return {};

  return {
    title: data.title,
  };
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const t = await i18next.getFixedT(request, ["weapons", "common"], {
    lng: "en",
  });
  const weaponId = mainWeaponIds.find(
    (id) => mySlugify(t(`weapons:MAIN_${id}`)) === params["slug"]
  );

  if (typeof weaponId !== "number" || !weaponIdIsNotAlt(weaponId)) {
    throw new Response(null, { status: 404 });
  }

  const url = new URL(request.url);
  const limit = Math.min(
    Number(url.searchParams.get("limit") ?? BUILDS_PAGE_BATCH_SIZE),
    BUILDS_PAGE_MAX_BUILDS
  );

  return {
    weaponId,
    title: makeTitle([t(`weapons:MAIN_${weaponId}`), t("common:pages.builds")]),
    builds: db.builds.buildsByWeaponId({
      weaponId,
      limit,
    }),
    limit,
  };
};

export default function WeaponsBuildsPage() {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation(["common"]);

  return (
    <div className="stack lg">
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
            tiny
            to={`?limit=${data.limit + BUILDS_PAGE_BATCH_SIZE}`}
            state={{ scroll: false }}
          >
            {t("common:actions.loadMore")}
          </LinkButton>
        )}
    </div>
  );
}

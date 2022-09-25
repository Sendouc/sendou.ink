import {
  type MetaFunction,
  type LoaderArgs,
  type SerializeFrom,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BuildCard } from "~/components/BuildCard";
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

  return {
    weaponId,
    title: makeTitle([t(`weapons:MAIN_${weaponId}`), t("common:pages.builds")]),
    builds: db.builds.buildsByWeaponId(weaponId),
  };
};

export default function WeaponsBuildsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="builds-container">
      {data.builds.map((build) => (
        <BuildCard
          key={build.id}
          id={build.id}
          title={build.title}
          description={build.description}
          headGearSplId={build.headGearSplId}
          clothesGearSplId={build.clothesGearSplId}
          shoesGearSplId={build.shoesGearSplId}
          modes={build.modes}
          updatedAt={build.updatedAt}
          abilities={build.abilities}
          weapons={build.weapons}
          canEdit={false}
        />
      ))}
    </div>
  );
}

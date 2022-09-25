import {
  type MetaFunction,
  type LoaderArgs,
  type SerializeFrom,
} from "@remix-run/node";
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
  };
};

export default function WeaponsBuildsPage() {
  return <div>Hellou</div>;
}

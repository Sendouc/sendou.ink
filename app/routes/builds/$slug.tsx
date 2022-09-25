import { type LoaderArgs } from "@remix-run/node";
import { i18next } from "~/modules/i18n";
import { mainWeaponIds, weaponIdIsNotAlt } from "~/modules/in-game-lists";
import { mySlugify } from "~/utils/urls";

export const loader = async ({ request, params }: LoaderArgs) => {
  const t = await i18next.getFixedT(request, ["weapons"], { lng: "en" });
  const weaponId = mainWeaponIds.find(
    (id) => mySlugify(t(`weapons:MAIN_${id}`)) === params["slug"]
  );

  if (typeof weaponId !== "number" || !weaponIdIsNotAlt(weaponId)) {
    throw new Response(null, { status: 404 });
  }

  return { weaponId };
};

export default function WeaponsBuildsPage() {
  return <div>Hellou</div>;
}

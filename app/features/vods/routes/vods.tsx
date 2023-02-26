import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { WeaponCombobox } from "~/components/Combobox";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { useTranslation } from "~/hooks/useTranslation";
import { requireUserId } from "~/modules/auth/user.server";
import { mainWeaponIds, modesShort, stageIds } from "~/modules/in-game-lists";
import { isAdmin } from "~/permissions";
import type { SendouRouteHandle } from "~/utils/remix";
import { VodListing } from "../components/VodListing";
import { findVods } from "../queries/findVods";
import { videoMatchTypes } from "../vods-constants";
import styles from "../vods.css";

export const handle: SendouRouteHandle = {
  i18n: ["vods"],
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUserId(request);

  if (!isAdmin(user)) {
    throw redirect("/");
  }
  const url = new URL(request.url);

  const vods = findVods(
    Object.fromEntries(
      Array.from(url.searchParams.entries()).filter(([, value]) => value)
    )
  );

  return { vods };
};

export default function VodsSearchPage() {
  const { t } = useTranslation(["vods"]);
  const data = useLoaderData<typeof loader>();

  return (
    <Main className="stack lg">
      <Filters />
      {data.vods.length > 0 ? (
        <div className="vods__listing__list">
          {data.vods.map((vod) => (
            <VodListing key={vod.id} vod={vod} />
          ))}
        </div>
      ) : (
        <div className="text-lg text-lighter">{t("vods:noVods")}</div>
      )}
    </Main>
  );
}

function Filters() {
  const { t } = useTranslation(["game-misc", "vods"]);

  const [searchParams, setSearchParams] = useSearchParams();
  const mode = modesShort.find(
    (mode) => searchParams.get("mode") && mode === searchParams.get("mode")
  );
  const stageId = stageIds.find(
    (stageId) =>
      searchParams.get("stageId") &&
      stageId === Number(searchParams.get("stageId"))
  );
  const weapon = mainWeaponIds.find(
    (id) =>
      searchParams.get("weapon") && id === Number(searchParams.get("weapon"))
  );
  const type = videoMatchTypes.find(
    (type) => searchParams.get("type") && type === searchParams.get("type")
  );

  const addToSearchParams = (key: string, value: string | number) => {
    setSearchParams((params) => ({
      ...Object.fromEntries(params.entries()),
      [key]: String(value),
    }));
  };

  return (
    <div className="stack sm horizontal flex-wrap">
      <div>
        <Label>{t("vods:forms.title.mode")}</Label>
        <select
          name="mode"
          value={mode ?? ""}
          onChange={(e) => addToSearchParams("mode", e.target.value)}
        >
          <option value="">-</option>
          {modesShort.map((mode) => {
            return (
              <option key={mode} value={mode}>
                {t(`game-misc:MODE_SHORT_${mode}`)}
              </option>
            );
          })}
        </select>
      </div>
      <div>
        <Label>{t("vods:forms.title.stage")}</Label>
        <select
          name="stage"
          value={stageId ?? ""}
          onChange={(e) => addToSearchParams("stageId", e.target.value)}
        >
          <option value="">-</option>
          {stageIds.map((stageId) => {
            return (
              <option key={stageId} value={stageId}>
                {t(`game-misc:STAGE_${stageId}`)}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <Label>{t("vods:forms.title.weapon")}</Label>
        <WeaponCombobox
          inputName="weapon"
          initialWeaponId={weapon}
          onChange={(selected) => {
            addToSearchParams("weapon", selected?.value ?? "");
          }}
          nullable
        />
      </div>

      <div>
        <Label>{t("vods:forms.title.type")}</Label>
        <select
          name="type"
          className="vods__type-select"
          value={type ?? ""}
          onChange={(e) => addToSearchParams("type", e.target.value)}
        >
          <option value="">-</option>
          {videoMatchTypes.map((type) => {
            return (
              <option key={type} value={type}>
                {t(`vods:type.${type}`)}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}

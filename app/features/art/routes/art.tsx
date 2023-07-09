import type {
  LoaderArgs,
  SerializeFrom,
  V2_MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { Toggle } from "~/components/Toggle";
import { i18next } from "~/modules/i18n";
import { validate, type SendouRouteHandle } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { ART_PAGE, navIconUrl } from "~/utils/urls";
import { ArtGrid } from "../components/ArtGrid";
import { showcaseArts } from "../queries/showcaseArts.server";
import { requireUser } from "~/modules/auth";
import { temporaryCanAccessArtCheck } from "../art-utils";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import { useTranslation } from "~/hooks/useTranslation";

export const handle: SendouRouteHandle = {
  i18n: ["art"],
  breadcrumb: () => ({
    imgPath: navIconUrl("art"),
    href: ART_PAGE,
    type: "IMAGE",
  }),
};

export const meta: V2_MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader> | null;

  if (!data) return [];

  return [{ title: data.title }];
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  validate(temporaryCanAccessArtCheck(user), "Insufficient permissions");

  const t = await i18next.getFixedT(request);

  return {
    arts: showcaseArts(),
    title: makeTitle(t("pages.art")),
  };
};

export default function ArtPage() {
  const { t } = useTranslation(["art"]);
  const data = useLoaderData<typeof loader>();
  const [showOpenCommissions, setShowOpenCommissions] = useSearchParamState({
    defaultValue: false,
    name: "open",
    revive: (value) => value === "true",
  });

  const arts = !showOpenCommissions
    ? data.arts
    : data.arts.filter((art) => art.author?.commissionsOpen);

  return (
    <Main className="stack lg">
      <div className="stack horizontal sm text-sm font-semi-bold">
        <Toggle
          checked={showOpenCommissions}
          setChecked={setShowOpenCommissions}
          id="open"
        />
        <Label htmlFor="open" className="m-auto-0">
          {t("art:openCommissionsOnly")}
        </Label>
      </div>
      <ArtGrid arts={arts} />
    </Main>
  );
}

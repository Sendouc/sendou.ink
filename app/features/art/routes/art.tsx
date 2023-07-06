import type {
  LoaderArgs,
  SerializeFrom,
  V2_MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import * as React from "react";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { Toggle } from "~/components/Toggle";
import { i18next } from "~/modules/i18n";
import type { SendouRouteHandle } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { ART_PAGE, navIconUrl } from "~/utils/urls";
import { ArtGrid } from "../components/ArtGrid";
import { showcaseArts } from "../queries/showcaseArts.server";

export const handle: SendouRouteHandle = {
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
  const t = await i18next.getFixedT(request);

  return {
    arts: showcaseArts(),
    title: makeTitle(t("pages.art")),
  };
};

export default function ArtPage() {
  const data = useLoaderData<typeof loader>();
  const [showOpenCommissions, setShowOpenCommissions] = React.useState(false);

  const arts = !showOpenCommissions
    ? data.arts
    : data.arts.filter((art) => art.author.commissionsOpen);

  return (
    <Main className="stack lg">
      <div className="stack horizontal sm text-sm font-semi-bold">
        <Toggle
          checked={showOpenCommissions}
          setChecked={setShowOpenCommissions}
          id="open"
        />
        <Label htmlFor="open" className="m-auto-0">
          Show artists with open commissions
        </Label>
      </div>
      <ArtGrid arts={arts} />
    </Main>
  );
}

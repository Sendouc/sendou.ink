import { Main } from "~/components/Main";
import type { SendouRouteHandle } from "~/utils/remix";
import { ART_PAGE, navIconUrl, userArtPage } from "~/utils/urls";
import type { ShowcaseArt } from "../queries/showcaseArts.server";
import { showcaseArts } from "../queries/showcaseArts.server";
import { Link, useLoaderData } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Avatar } from "~/components/Avatar";
import { discordFullName } from "~/utils/strings";
import * as React from "react";
import { Toggle } from "~/components/Toggle";
import { Label } from "~/components/Label";
import { useIsMounted } from "~/hooks/useIsMounted";

export const handle: SendouRouteHandle = {
  breadcrumb: () => ({
    imgPath: navIconUrl("art"),
    href: ART_PAGE,
    type: "IMAGE",
  }),
};

export const loader = () => {
  return {
    arts: showcaseArts(),
  };
};

export default function ArtPage() {
  const data = useLoaderData<typeof loader>();
  const [showOpenCommissions, setShowOpenCommissions] = React.useState(false);

  const arts = !showOpenCommissions
    ? data.arts
    : data.arts.filter((art) => art.commissionsOpen);

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

// xxx: to separate file
// xxx: add pagination
function ArtGrid({ arts }: { arts: ShowcaseArt[] }) {
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  return (
    <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
      <Masonry gutter="1rem">
        {arts.map((art) => {
          return (
            <Link key={art.id} to={userArtPage(art)}>
              <img alt="" src={art.url} loading="lazy" />
              <div className="stack sm horizontal text-xs items-center mt-1">
                <Avatar user={art} size="xxs" />
                {discordFullName(art)}
              </div>
            </Link>
          );
        })}
      </Masonry>
    </ResponsiveMasonry>
  );
}

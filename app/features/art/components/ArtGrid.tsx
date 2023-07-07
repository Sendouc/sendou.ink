import { Link } from "@remix-run/react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Avatar } from "~/components/Avatar";
import { useIsMounted } from "~/hooks/useIsMounted";
import { discordFullName } from "~/utils/strings";
import { userArtPage } from "~/utils/urls";
import type { ListedArt } from "../art-types";
import { Dialog } from "~/components/Dialog";
import * as React from "react";

// xxx: add pagination
export function ArtGrid({
  arts,
  enablePreview = false,
}: {
  arts: ListedArt[];
  enablePreview?: boolean;
}) {
  const [bigArt, setBigArt] = React.useState<ListedArt | null>(null);
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  return (
    <>
      {bigArt ? (
        <Dialog
          isOpen
          close={() => setBigArt(null)}
          className="art__dialog__image-container"
          closeOnAnyClick
        >
          <img
            alt=""
            src={bigArt.url}
            loading="lazy"
            className="art__dialog__img"
          />
          {bigArt.description ? (
            <div className="art__dialog__description">{bigArt.description}</div>
          ) : null}
        </Dialog>
      ) : null}
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
        <Masonry gutter="1rem">
          {arts.map((art) => {
            const img = (
              <img
                key={art.id}
                alt=""
                src={art.url}
                loading="lazy"
                onClick={enablePreview ? () => setBigArt(art) : undefined}
              />
            );

            if (!art.author) return img;

            // whole thing is not a link so we can preview the image
            if (enablePreview) {
              return (
                <div key={art.id}>
                  {img}
                  <Link
                    to={userArtPage(art.author, "MADE-BY")}
                    className="stack sm horizontal text-xs items-center mt-1"
                  >
                    <Avatar user={art.author} size="xxs" />
                    {discordFullName(art.author)}
                  </Link>
                </div>
              );
            }

            return (
              <Link key={art.id} to={userArtPage(art.author, "MADE-BY")}>
                {img}
                <div className="stack sm horizontal text-xs items-center mt-1">
                  <Avatar user={art.author} size="xxs" />
                  {discordFullName(art.author)}
                </div>
              </Link>
            );
          })}
        </Masonry>
      </ResponsiveMasonry>
    </>
  );
}

import { Link } from "@remix-run/react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Avatar } from "~/components/Avatar";
import { useIsMounted } from "~/hooks/useIsMounted";
import { discordFullName } from "~/utils/strings";
import { userArtPage } from "~/utils/urls";
import type { ListedArt } from "../art-types";
import { Dialog } from "~/components/Dialog";
import * as React from "react";
import { useSimplePagination } from "~/hooks/useSimplePagination";
import { ART_PER_PAGE } from "../art-constants";
import { Button } from "~/components/Button";
import { ArrowRightIcon } from "~/components/icons/ArrowRight";
import { ArrowLeftIcon } from "~/components/icons/ArrowLeft";
import { nullFilledArray } from "~/utils/arrays";
import clsx from "clsx";

export function ArtGrid({
  arts,
  enablePreview = false,
}: {
  arts: ListedArt[];
  enablePreview?: boolean;
}) {
  const {
    itemsToDisplay,
    everythingVisible,
    currentPage,
    pagesCount,
    nextPage,
    previousPage,
  } = useSimplePagination({
    items: arts,
    pageSize: ART_PER_PAGE,
  });
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
          {itemsToDisplay.map((art) => {
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
      {!everythingVisible ? (
        <SimplePagination
          currentPage={currentPage}
          pagesCount={pagesCount}
          nextPage={nextPage}
          previousPage={previousPage}
        />
      ) : null}
    </>
  );
}

function SimplePagination({
  currentPage,
  pagesCount,
  nextPage,
  previousPage,
}: {
  currentPage: number;
  pagesCount: number;
  nextPage: () => void;
  previousPage: () => void;
}) {
  return (
    <div className="stack sm horizontal items-center justify-center flex-wrap">
      <Button
        icon={<ArrowLeftIcon />}
        variant="outlined"
        disabled={currentPage === 1}
        onClick={previousPage}
        aria-label="Previous page"
      />
      {nullFilledArray(pagesCount).map((_, i) => (
        <div
          key={i}
          className={clsx("pagination__dot", {
            pagination__dot__active: i === currentPage - 1,
          })}
        />
      ))}
      <Button
        icon={<ArrowRightIcon />}
        variant="outlined"
        disabled={currentPage === pagesCount}
        onClick={nextPage}
        aria-label="Next page"
      />
    </div>
  );
}

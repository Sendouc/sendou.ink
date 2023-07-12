import { Link } from "@remix-run/react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Avatar } from "~/components/Avatar";
import { useIsMounted } from "~/hooks/useIsMounted";
import { discordFullName } from "~/utils/strings";
import {
  artPage,
  conditionalUserSubmittedImage,
  newArtPage,
  userArtPage,
  userPage,
} from "~/utils/urls";
import type { ListedArt } from "../art-types";
import { Dialog } from "~/components/Dialog";
import * as React from "react";
import { useSimplePagination } from "~/hooks/useSimplePagination";
import { ART_PER_PAGE } from "../art-constants";
import { Button, LinkButton } from "~/components/Button";
import { ArrowRightIcon } from "~/components/icons/ArrowRight";
import { ArrowLeftIcon } from "~/components/icons/ArrowLeft";
import { nullFilledArray } from "~/utils/arrays";
import clsx from "clsx";
import { EditIcon } from "~/components/icons/Edit";
import { useTranslation } from "~/hooks/useTranslation";
import { previewUrl } from "../art-utils";
import { TrashIcon } from "~/components/icons/Trash";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { useSearchParamState } from "~/hooks/useSearchParamState";

export function ArtGrid({
  arts,
  enablePreview = false,
  canEdit = false,
}: {
  arts: ListedArt[];
  enablePreview?: boolean;
  canEdit?: boolean;
}) {
  const {
    itemsToDisplay,
    everythingVisible,
    currentPage,
    pagesCount,
    nextPage,
    previousPage,
    setPage,
  } = useSimplePagination({
    items: arts,
    pageSize: ART_PER_PAGE,
  });
  const [bigArtId, setBigArtId] = useSearchParamState<number | null>({
    defaultValue: null,
    name: "big",
    revive: (value) =>
      itemsToDisplay.find((art) => art.id === Number(value))?.id,
  });
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  const bigArt = itemsToDisplay.find((art) => art.id === bigArtId);

  return (
    <>
      {bigArt ? (
        <BigImageDialog close={() => setBigArtId(null)} art={bigArt} />
      ) : null}
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
        <Masonry gutter="1rem">
          {itemsToDisplay.map((art) => (
            <ImagePreview
              key={art.id}
              art={art}
              canEdit={canEdit}
              enablePreview={enablePreview}
              onClick={enablePreview ? () => setBigArtId(art.id) : undefined}
            />
          ))}
        </Masonry>
      </ResponsiveMasonry>
      {!everythingVisible ? (
        <SimplePagination
          currentPage={currentPage}
          pagesCount={pagesCount}
          nextPage={nextPage}
          previousPage={previousPage}
          setPage={setPage}
        />
      ) : null}
    </>
  );
}

function BigImageDialog({ close, art }: { close: () => void; art: ListedArt }) {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  return (
    <Dialog
      isOpen
      close={close}
      className="art__dialog__image-container"
      closeOnAnyClick
    >
      <img
        alt=""
        src={conditionalUserSubmittedImage(art.url)}
        loading="lazy"
        className="art__dialog__img"
        onLoad={() => setImageLoaded(true)}
      />
      {art.tags || art.linkedUsers ? (
        <div className="stack sm horizontal">
          {art.linkedUsers?.map((user) => (
            <Link
              to={userPage(user)}
              key={user.discordId}
              className="art__dialog__tag art__dialog__tag__user"
            >
              {discordFullName(user)}
            </Link>
          ))}
          {art.tags?.map((tag) => (
            <Link to={artPage(tag)} key={tag} className="art__dialog__tag">
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}
      {art.description ? (
        <div
          className={clsx("art__dialog__description", {
            invisible: !imageLoaded,
          })}
        >
          {art.description}
        </div>
      ) : null}
    </Dialog>
  );
}

function ImagePreview({
  art,
  onClick,
  enablePreview = false,
  canEdit = false,
}: {
  art: ListedArt;
  onClick?: () => void;
  enablePreview?: boolean;
  canEdit?: boolean;
}) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const { t } = useTranslation(["common", "art"]);

  const img = (
    <img
      alt=""
      src={conditionalUserSubmittedImage(previewUrl(art.url))}
      loading="lazy"
      onClick={onClick}
      onLoad={() => setImageLoaded(true)}
      className={enablePreview ? "art__thumbnail" : undefined}
    />
  );

  if (!art.author && canEdit) {
    return (
      <div>
        {img}
        <div
          className={clsx("stack horizontal justify-between mt-2", {
            invisible: !imageLoaded,
          })}
        >
          <LinkButton
            to={newArtPage(art.id)}
            size="tiny"
            variant="outlined"
            icon={<EditIcon />}
          >
            {t("common:actions.edit")}
          </LinkButton>
          <FormWithConfirm
            dialogHeading="Are you sure you want to delete the art?"
            fields={[["id", art.id]]}
          >
            <Button icon={<TrashIcon />} variant="destructive" size="tiny" />
          </FormWithConfirm>
        </div>
      </div>
    );
  }
  if (!art.author) return img;

  // whole thing is not a link so we can preview the image
  if (enablePreview) {
    return (
      <div>
        {img}
        <Link
          to={userArtPage(art.author, "MADE-BY")}
          className={clsx("stack sm horizontal text-xs items-center mt-1", {
            invisible: !imageLoaded,
          })}
        >
          <Avatar user={art.author} size="xxs" />
          {t("art:madeBy")} {discordFullName(art.author)}
        </Link>
      </div>
    );
  }

  return (
    <Link to={userArtPage(art.author, "MADE-BY")}>
      {img}
      <div
        className={clsx("stack sm horizontal text-xs items-center mt-1", {
          invisible: !imageLoaded,
        })}
      >
        <Avatar user={art.author} size="xxs" />
        {discordFullName(art.author)}
      </div>
    </Link>
  );
}

function SimplePagination({
  currentPage,
  pagesCount,
  nextPage,
  previousPage,
  setPage,
}: {
  currentPage: number;
  pagesCount: number;
  nextPage: () => void;
  previousPage: () => void;
  setPage: (page: number) => void;
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
          onClick={() => setPage(i + 1)}
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

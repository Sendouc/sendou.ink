import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import type { UserPageLoaderData } from "../u.$identifier";
import { userParamsSchema } from "../u.$identifier";
import {
  type SendouRouteHandle,
  notFoundIfFalsy,
  validate,
  parseRequestFormData,
} from "~/utils/remix";
import { db } from "~/db";
import {
  artsByUserId,
  ArtGrid,
  type ArtSouce,
  ART_SOURCES,
  findArtById,
} from "~/features/art";
import { useLoaderData, useMatches } from "@remix-run/react";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import { requireUser, useUser } from "~/modules/auth";
import {
  temporaryCanAccessArtCheck,
  deleteArt,
  deleteArtSchema,
} from "~/features/art";
import invariant from "tiny-invariant";
import { LinkButton } from "~/components/Button";
import { Popover } from "~/components/Popover";
import { countUnvalidatedArt } from "~/features/img-upload";
import { useTranslation } from "~/hooks/useTranslation";
import { newArtPage } from "~/utils/urls";

export const handle: SendouRouteHandle = {
  i18n: ["art"],
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema: deleteArtSchema,
  });

  // this actually doesn't delete the image itself from the static hosting
  // but the idea is that storage is cheap anyway and if needed later
  // then we can have a routine that checks all the images still current and nukes the rest
  const artToDelete = findArtById(data.id);
  validate(artToDelete?.authorId === user.id, "Insufficient permissions", 401);

  deleteArt(data.id);

  return null;
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const loggedInUser = await requireUser(request);
  validate(
    temporaryCanAccessArtCheck(loggedInUser),
    "Insufficient permissions"
  );

  const { identifier } = userParamsSchema.parse(params);
  const user = notFoundIfFalsy(db.users.findByIdentifier(identifier));

  return {
    arts: artsByUserId(user.id),
    unvalidatedArtCount:
      user.id === loggedInUser.id ? countUnvalidatedArt(user.id) : 0,
  };
};

export default function UserArtPage() {
  const { t } = useTranslation(["art"]);
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const [type, setType] = useSearchParamState<ArtSouce>({
    defaultValue: "ALL",
    name: "source",
    revive: (value) => ART_SOURCES.find((s) => s === value),
  });
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const userPageData = parentRoute.data as UserPageLoaderData;

  const hasBothArtMadeByAndMadeOf =
    data.arts.some((a) => a.author) && data.arts.some((a) => !a.author);

  const arts =
    type === "ALL" || !hasBothArtMadeByAndMadeOf
      ? data.arts
      : type === "MADE-BY"
      ? data.arts.filter((a) => !a.author)
      : data.arts.filter((a) => a.author);

  return (
    <div className="stack md">
      <div className="stack horizontal justify-between items-start text-xs text-lighter">
        <div>
          {data.unvalidatedArtCount > 0
            ? t("art:pendingApproval", { count: data.unvalidatedArtCount })
            : null}
        </div>
        {userPageData.id === user?.id ? (
          <AddArtButton isArtist={Boolean(user.isArtist)} />
        ) : null}
      </div>

      {hasBothArtMadeByAndMadeOf ? (
        <div className="stack md horizontal">
          <div className="stack xs horizontal items-center">
            <input
              type="radio"
              id="all"
              checked={type === "ALL"}
              onChange={() => setType("ALL")}
            />
            <label htmlFor="all" className="mb-0">
              {t("art:radios.all")}
            </label>
          </div>
          <div className="stack xs horizontal items-center">
            <input
              type="radio"
              id="made-by"
              checked={type === "MADE-BY"}
              onChange={() => setType("MADE-BY")}
            />
            <label htmlFor="made-by" className="mb-0">
              {t("art:radios.madeBy")}
            </label>
          </div>
          <div className="stack xs horizontal items-center">
            <input
              type="radio"
              id="made-of"
              checked={type === "MADE-OF"}
              onChange={() => setType("MADE-OF")}
            />
            <label htmlFor="made-of" className="mb-0">
              {t("art:radios.madeFor")}
            </label>
          </div>
        </div>
      ) : null}

      {userPageData.commissionsOpen ? (
        <div className="whitespace-pre-wrap">
          <span className="art__comms-open-header">
            {t("art:commissionsOpen")} {">>>"}
          </span>{" "}
          {userPageData.commissionText}
        </div>
      ) : null}

      <ArtGrid
        arts={arts}
        enablePreview
        canEdit={userPageData.id === user?.id}
      />
    </div>
  );
}

function AddArtButton({ isArtist }: { isArtist?: boolean }) {
  const { t } = useTranslation(["art"]);

  if (!isArtist) {
    return (
      <Popover
        buttonChildren={<>{t("art:addArt")}</>}
        triggerClassName="tiny"
        containerClassName="text-center"
      >
        {t("art:commissionsOpen")}
      </Popover>
    );
  }

  return (
    <LinkButton to={newArtPage()} size="tiny" className="whitespace-no-wrap">
      {t("art:addArt")}
    </LinkButton>
  );
}

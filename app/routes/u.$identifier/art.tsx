import type { LoaderArgs } from "@remix-run/node";
import type { UserPageLoaderData } from "../u.$identifier";
import { userParamsSchema } from "../u.$identifier";
import {
  type SendouRouteHandle,
  notFoundIfFalsy,
  validate,
} from "~/utils/remix";
import { db } from "~/db";
import {
  artsByUserId,
  ArtGrid,
  type ArtSouce,
  ART_SOURCES,
} from "~/features/art";
import { useLoaderData, useMatches } from "@remix-run/react";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import { requireUser, useUser } from "~/modules/auth";
import { temporaryCanAccessArtCheck } from "~/features/art";
import invariant from "tiny-invariant";
import { LinkButton } from "~/components/Button";
import { Popover } from "~/components/Popover";
import { countUnvalidatedArt } from "~/features/img-upload";
import { Alert } from "~/components/Alert";
import { useTranslation } from "~/hooks/useTranslation";
import { newArtPage } from "~/utils/urls";

export const handle: SendouRouteHandle = {
  i18n: ["art"],
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

// xxx: opening preview scrolls page to top
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
      {userPageData.id === user?.id ? (
        <AddArtButton isArtist={Boolean(user.isArtist)} />
      ) : null}

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
              All
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
              Art made by
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
              Art made of
            </label>
          </div>
        </div>
      ) : null}

      {userPageData.commissionsOpen ? (
        <div className="whitespace-pre-wrap">
          <span className="art__comms-open-header">
            Commissions are open {">>>"}
          </span>{" "}
          {userPageData.commissionText}
        </div>
      ) : null}

      {data.unvalidatedArtCount > 0 ? (
        <Alert>
          {t("art:pendingApproval", { count: data.unvalidatedArtCount })}
        </Alert>
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
  if (!isArtist) {
    return (
      <div className="stack items-end">
        <Popover
          buttonChildren={<>Add art</>}
          triggerClassName="tiny"
          containerClassName="text-center"
        >
          Please send a message to Sendou on Discord to gain permissions
        </Popover>
      </div>
    );
  }

  return (
    <div className="stack items-end">
      <LinkButton to={newArtPage()} size="tiny">
        Add art
      </LinkButton>
    </div>
  );
}

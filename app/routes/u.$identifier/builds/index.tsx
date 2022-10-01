import type { ActionFunction } from "@remix-run/node";
import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData, useMatches } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { BuildCard } from "~/components/BuildCard";
import { LinkButton } from "~/components/Button";
import { Main } from "~/components/Main";
import { BUILD } from "~/constants";
import { db } from "~/db";
import { getUser, requireUser, useUser } from "~/modules/auth";
import { atOrError } from "~/utils/arrays";
import { notFoundIfFalsy, parseRequestFormData } from "~/utils/remix";
import { userNewBuildPage } from "~/utils/urls";
import { actualNumber, id } from "~/utils/zod";
import { type UserPageLoaderData, userParamsSchema } from "../../u.$identifier";

const buildsActionSchema = z.object({
  buildToDeleteId: z.preprocess(actualNumber, id),
});

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema: buildsActionSchema,
  });

  if (
    !db.builds
      .buildsByUserId(user.id)
      .some((build) => build.id === data.buildToDeleteId)
  ) {
    throw new Response(null, { status: 400 });
  }

  db.builds.deleteById(data.buildToDeleteId);

  return null;
};

export const handle = {
  i18n: ["weapons", "builds"],
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const loggedInUser = await getUser(request);
  const { identifier } = userParamsSchema.parse(params);
  const user = notFoundIfFalsy(db.users.findByIdentifier(identifier));

  const builds = db.builds.buildsByUserId(user.id);

  if (builds.length === 0 && loggedInUser?.id !== user.id) {
    throw new Response(null, { status: 404 });
  }

  return json({ builds });
};

export default function UserBuildsPage() {
  const { t } = useTranslation("builds");
  const user = useUser();
  const parentPageData = atOrError(useMatches(), -2).data as UserPageLoaderData;
  const data = useLoaderData<typeof loader>();

  const isOwnPage = user?.id === parentPageData.id;

  return (
    <Main className="stack lg">
      {data.builds.length < BUILD.MAX_COUNT && isOwnPage && (
        <div className="stack items-end">
          <LinkButton
            to={userNewBuildPage(parentPageData)}
            tiny
            data-cy="new-build-button"
          >
            {t("addBuild")}
          </LinkButton>
        </div>
      )}
      {data.builds.length > 0 ? (
        <div className="builds-container">
          {data.builds.map((build) => (
            <BuildCard key={build.id} build={build} canEdit={isOwnPage} />
          ))}
        </div>
      ) : (
        <div className="text-center text-lg text-lighter font-semi-bold">
          {t("noBuilds")}
        </div>
      )}
    </Main>
  );
}

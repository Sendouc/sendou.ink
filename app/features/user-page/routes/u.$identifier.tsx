import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { userTopPlacements } from "~/features/top-search";
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/features/auth/core/user";
import { getUserId } from "~/features/auth/core/user.server";
import { canAddCustomizedColorsToUserProfile, isAdmin } from "~/permissions";
import "~/styles/u.css";
import { notFoundIfFalsy, type SendouRouteHandle } from "~/utils/remix";
import { discordFullName, makeTitle } from "~/utils/strings";
import {
  isCustomUrl,
  navIconUrl,
  userBuildsPage,
  userEditProfilePage,
  userPage,
  userResultsPage,
  userVodsPage,
  USER_SEARCH_PAGE,
  userArtPage,
  userSeasonsPage,
} from "~/utils/urls";
import * as BadgeRepository from "~/features/badges/BadgeRepository.server";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import * as BuildRepository from "~/features/builds/BuildRepository.server";
import { findVods } from "~/features/vods/queries/findVods.server";
import { countArtByUserId } from "~/features/art/queries/countArtByUserId.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  return [{ title: makeTitle(discordFullName(data)) }];
};

export const handle: SendouRouteHandle = {
  i18n: "user",
  breadcrumb: ({ match }) => {
    const data = match.data as UserPageLoaderData | undefined;

    if (!data) return [];

    return [
      {
        imgPath: navIconUrl("u"),
        href: USER_SEARCH_PAGE,
        type: "IMAGE",
      },
      {
        text: data.discordName,
        href: userPage(data),
        type: "TEXT",
      },
    ];
  },
};

export const userParamsSchema = z.object({ identifier: z.string() });

export type UserPageLoaderData = SerializeFrom<typeof loader>;

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const loggedInUser = await getUserId(request);
  const { identifier } = userParamsSchema.parse(params);
  const user = notFoundIfFalsy(
    await UserRepository.findByIdentifier(identifier),
  );

  return {
    ...user,
    ...userTopPlacements(user.id),
    discordUniqueName: user.showDiscordUniqueName
      ? user.discordUniqueName
      : null,
    banned: isAdmin(loggedInUser) ? user.banned : undefined,
    css: canAddCustomizedColorsToUserProfile(user) ? user.css : undefined,
    badges: await BadgeRepository.findByOwnerId({
      userId: user.id,
      favoriteBadgeId: user.favoriteBadgeId,
    }),
    results: await UserRepository.findResultsByUserId(user.id),
    buildsCount: await BuildRepository.countByUserId({
      userId: user.id,
      showPrivate: user.id === loggedInUser?.id,
    }),
    vods: findVods({ userId: user.id }),
    artCount: countArtByUserId(user.id),
  };
};

export default function UserPageLayout() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();
  const { t } = useTranslation();

  const isOwnPage = data.id === user?.id;

  useReplaceWithCustomUrl();

  return (
    <Main>
      <SubNav>
        <SubNavLink to={userPage(data)}>{t("header.profile")}</SubNavLink>
        <SubNavLink to={userSeasonsPage({ user: data })}>Seasons</SubNavLink>
        {isOwnPage && (
          <SubNavLink to={userEditProfilePage(data)} prefetch="intent">
            {t("actions.edit")}
          </SubNavLink>
        )}
        {data.results.length > 0 && (
          <SubNavLink to={userResultsPage(data)}>
            {t("results")} ({data.results.length})
          </SubNavLink>
        )}
        {(isOwnPage || data.buildsCount > 0) && (
          <SubNavLink
            to={userBuildsPage(data)}
            prefetch="intent"
            data-testid="builds-tab"
          >
            {t("pages.builds")} ({data.buildsCount})
          </SubNavLink>
        )}
        {data.vods.length > 0 && (
          <SubNavLink to={userVodsPage(data)}>
            {t("pages.vods")} ({data.vods.length})
          </SubNavLink>
        )}
        {(isOwnPage || data.artCount > 0) && (
          <SubNavLink to={userArtPage(data)} end={false}>
            {t("pages.art")} ({data.artCount})
          </SubNavLink>
        )}
      </SubNav>
      {data.banned ? <div className="text-warning">Banned</div> : null}
      <Outlet />
    </Main>
  );
}

function useReplaceWithCustomUrl() {
  const data = useLoaderData<typeof loader>();
  const location = useLocation();

  React.useEffect(() => {
    if (!data.customUrl) {
      return;
    }

    const identifier = location.pathname.replace("/u/", "").split("/")[0];
    invariant(identifier);

    if (isCustomUrl(identifier)) {
      return;
    }

    window.history.replaceState(
      null,
      "",
      location.pathname
        .split("/")
        .map((part) => (part === identifier ? data.customUrl : part))
        .join("/"),
    );
  }, [location, data.customUrl]);
}

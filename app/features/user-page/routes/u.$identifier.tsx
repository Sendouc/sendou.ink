import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import * as React from "react";
import invariant from "~/utils/invariant";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { userTopPlacements } from "~/features/top-search";
import { useTranslation } from "react-i18next";
import { useUser } from "~/features/auth/core/user";
import { getUserId } from "~/features/auth/core/user.server";
import { canAddCustomizedColorsToUserProfile, isAdmin } from "~/permissions";
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
import { countArtByUserId } from "~/features/art/queries/countArtByUserId.server";
import { findVods } from "~/features/vods/queries/findVods.server";
import { userParamsSchema } from "../user-page-schemas.server";
import { userIsBanned } from "~/features/ban/core/banned.server";
import { databaseTimestampToDate } from "~/utils/dates";

import "~/styles/u.css";

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
    banned:
      isAdmin(loggedInUser) && userIsBanned(user.id)
        ? { banned: user.banned, bannedReason: user.bannedReason }
        : undefined,
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
  const { t } = useTranslation(["common", "user"]);

  const isOwnPage = data.id === user?.id;

  useReplaceWithCustomUrl();

  return (
    <Main>
      <SubNav>
        <SubNavLink to={userPage(data)}>
          {t("common:header.profile")}
        </SubNavLink>
        <SubNavLink to={userSeasonsPage({ user: data })}>
          {t("user:seasons")}
        </SubNavLink>
        {isOwnPage && (
          <SubNavLink to={userEditProfilePage(data)} prefetch="intent">
            {t("common:actions.edit")}
          </SubNavLink>
        )}
        {data.results.length > 0 && (
          <SubNavLink to={userResultsPage(data)}>
            {t("common:results")} ({data.results.length})
          </SubNavLink>
        )}
        {(isOwnPage || data.buildsCount > 0) && (
          <SubNavLink
            to={userBuildsPage(data)}
            prefetch="intent"
            data-testid="builds-tab"
          >
            {t("common:pages.builds")} ({data.buildsCount})
          </SubNavLink>
        )}
        {(isOwnPage || data.vods.length > 0) && (
          <SubNavLink to={userVodsPage(data)}>
            {t("common:pages.vods")} ({data.vods.length})
          </SubNavLink>
        )}
        {(isOwnPage || data.artCount > 0) && (
          <SubNavLink to={userArtPage(data)} end={false}>
            {t("common:pages.art")} ({data.artCount})
          </SubNavLink>
        )}
      </SubNav>
      <BannedInfo />
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

function BannedInfo() {
  const data = useLoaderData<typeof loader>();

  const { banned, bannedReason } = data.banned ?? {};

  if (!banned) return null;

  const ends = (() => {
    if (!banned || banned === 1) return null;

    return databaseTimestampToDate(banned);
  })();

  return (
    <div className="mb-4">
      <h2 className="text-warning">Account suspended</h2>
      {bannedReason ? <div>Reason: {bannedReason}</div> : null}
      {ends ? (
        <div suppressHydrationWarning>
          Ends:{" "}
          {ends.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
        </div>
      ) : (
        <div>
          Ends: <i>no end time set</i>
        </div>
      )}
    </div>
  );
}

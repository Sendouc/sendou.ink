import type {
  LinksFunction,
  LoaderArgs,
  V2_MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { db } from "~/db";
import { countArtByUserId } from "~/features/art";
import { userTopPlacements } from "~/features/top-search";
import { findVods } from "~/features/vods";
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/modules/auth";
import { getUserId } from "~/modules/auth/user.server";
import { canAddCustomizedColorsToUserProfile, isAdmin } from "~/permissions";
import styles from "~/styles/u.css";
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

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: V2_MetaFunction = ({
  data,
}: {
  data: UserPageLoaderData;
}) => {
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

export const loader = async ({ params, request }: LoaderArgs) => {
  const loggedInUser = await getUserId(request);
  const { identifier } = userParamsSchema.parse(params);
  const user = notFoundIfFalsy(db.users.findByIdentifier(identifier));

  const { playerId, topPlacements } = userTopPlacements(user.id);
  return json({
    id: user.id,
    discordAvatar: user.discordAvatar,
    discordDiscriminator: user.discordDiscriminator,
    discordId: user.discordId,
    discordName: user.discordName,
    discordUniqueName: user.showDiscordUniqueName
      ? user.discordUniqueName
      : null,
    showDiscordUniqueName: user.showDiscordUniqueName,
    twitch: user.twitch,
    twitter: user.twitter,
    youtubeId: user.youtubeId,
    bio: user.bio,
    customUrl: user.customUrl,
    motionSens: user.motionSens,
    stickSens: user.stickSens,
    inGameName: user.inGameName,
    weapons: user.weapons,
    team: user.team,
    country: user.country,
    banned: isAdmin(loggedInUser) ? user.banned : undefined,
    css: canAddCustomizedColorsToUserProfile(user) ? user.css : undefined,
    badges: await BadgeRepository.findByOwnerId({
      userId: user.id,
      favoriteBadgeId: user.favoriteBadgeId,
    }),
    // TODO: could load only on results page
    // xxx: investigate slow query - loads mates x 6000
    // xxx: bg difference with query duration time and route response time?
    // xxx: missing index at least on CalendarEventResultPlayer.userId?
    results: await UserRepository.findResultsByUserId(user.id),
    buildsCount: db.builds.countByUserId({
      userId: user.id,
      loggedInUserId: loggedInUser?.id,
    }),
    vods: findVods({ userId: user.id }),
    artCount: countArtByUserId(user.id),
    commissionsOpen: user.commissionsOpen,
    commissionText: user.commissionText,
    playerId,
    topPlacements,
  });
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

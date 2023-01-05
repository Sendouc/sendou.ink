import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
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
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/modules/auth";
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
  USER_SEARCH_PAGE,
} from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = ({ data }: { data: UserPageLoaderData }) => {
  if (!data) return {};

  return {
    title: makeTitle(discordFullName(data)),
  };
};

export const handle: SendouRouteHandle = {
  i18n: "user",
  breadcrumb: ({ match }) => {
    const data = match.data as UserPageLoaderData;

    if (!data) return;

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

export const loader = ({ params }: LoaderArgs) => {
  const { identifier } = userParamsSchema.parse(params);
  const user = notFoundIfFalsy(db.users.findByIdentifier(identifier));

  return json({
    id: user.id,
    discordAvatar: user.discordAvatar,
    discordDiscriminator: user.discordDiscriminator,
    discordId: user.discordId,
    discordName: user.discordName,
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
    badges: db.badges.countsByUserId(user.id),
    results: db.calendarEvents.findResultsByUserId(user.id),
    buildsCount: db.builds.countByUserId(user.id),
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
        {isOwnPage && (
          <SubNavLink to={userEditProfilePage(data)}>
            {t("actions.edit")}
          </SubNavLink>
        )}
        {data.results.length > 0 && (
          <SubNavLink to={userResultsPage(data)}>
            {t("results")} ({data.results.length})
          </SubNavLink>
        )}
        {(isOwnPage || data.buildsCount > 0) && (
          <SubNavLink to={userBuildsPage(data)}>
            {t("pages.builds")} ({data.buildsCount})
          </SubNavLink>
        )}
      </SubNav>
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
        .join("/")
    );
  }, [location, data.customUrl]);
}

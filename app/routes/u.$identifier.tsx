import * as React from "react";
import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { countries } from "countries-list";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { db } from "~/db";
import { useUser } from "~/modules/auth";
import { i18next } from "~/modules/i18n";
import { translatedCountry } from "~/utils/i18n.server";
import { notFoundIfFalsy, type SendouRouteHandle } from "~/utils/remix";
import { discordFullName, makeTitle } from "~/utils/strings";
import styles from "~/styles/u.css";
import invariant from "tiny-invariant";
import {
  isCustomUrl,
  userBuildsPage,
  userEditProfilePage,
  userPage,
  userResultsPage,
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
};

export const userParamsSchema = z.object({ identifier: z.string() });

export type UserPageLoaderData = SerializeFrom<typeof loader>;

export const loader = async ({ request, params }: LoaderArgs) => {
  const locale = await i18next.getLocale(request);
  const { identifier } = userParamsSchema.parse(params);
  const user = notFoundIfFalsy(db.users.findByIdentifier(identifier));

  const countryObj = user.country
    ? countries[user.country as keyof typeof countries]
    : undefined;

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
    country:
      countryObj && user.country
        ? {
            emoji: countryObj.emoji,
            code: user.country,
            name:
              translatedCountry({
                language: locale,
                countryCode: user.country,
              }) ?? countryObj.name,
          }
        : undefined,
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
    <>
      <SubNav>
        <SubNavLink to={userPage(data)} data-cy="profile-page-link">
          {t("header.profile")}
        </SubNavLink>
        {isOwnPage && (
          <SubNavLink to={userEditProfilePage(data)} data-cy="edit-page-link">
            {t("actions.edit")}
          </SubNavLink>
        )}
        {data.results.length > 0 && (
          <SubNavLink to={userResultsPage(data)} data-cy="results-page-link">
            {t("results")} ({data.results.length})
          </SubNavLink>
        )}
        {(isOwnPage || data.buildsCount > 0) && (
          <SubNavLink to={userBuildsPage(data)} data-cy="builds-page-link">
            {t("pages.builds")} ({data.buildsCount})
          </SubNavLink>
        )}
      </SubNav>
      <Outlet />
    </>
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

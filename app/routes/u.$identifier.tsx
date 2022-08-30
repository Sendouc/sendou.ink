import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import type { UseDataFunctionReturn } from "@remix-run/react/dist/components";
import { countries } from "countries-list";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { db } from "~/db";
import { useUser } from "~/modules/auth";
import { i18next } from "~/modules/i18n";
import { translatedCountry } from "~/utils/i18n.server";
import { notFoundIfFalsy } from "~/utils/remix";
import { discordFullName, makeTitle } from "~/utils/strings";
import styles from "~/styles/u.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = ({ data }: { data: UserPageLoaderData }) => {
  return {
    title: makeTitle(discordFullName(data)),
  };
};

export const handle = {
  i18n: "user",
};

export const userParamsSchema = z.object({ identifier: z.string() });

export type UserPageLoaderData = UseDataFunctionReturn<typeof loader>;

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

  return (
    <>
      <SubNav>
        <SubNavLink to="" data-cy="profile-page-link">
          {t("header.profile")}
        </SubNavLink>
        {isOwnPage && (
          <SubNavLink to="edit" data-cy="edit-page-link">
            {t("actions.edit")}
          </SubNavLink>
        )}
        {data.results.length > 0 && (
          <SubNavLink to="results" data-cy="results-page-link">
            {t("results")}
          </SubNavLink>
        )}
        {(isOwnPage || data.buildsCount > 0) && (
          <SubNavLink to="builds" data-cy="builds-page-link">
            {t("pages.builds")} ({data.buildsCount})
          </SubNavLink>
        )}
      </SubNav>
      <Outlet />
    </>
  );
}

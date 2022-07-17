import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { countries } from "countries-list";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { db } from "~/db";
import type { CountsByUserId } from "~/db/models/badges.server";
import type { User } from "~/db/types";
import { useUser } from "~/modules/auth";
import { i18next } from "~/modules/i18n";
import { translatedCountry } from "~/utils/i18n.server";
import { notFoundIfFalsy } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { discordFullName } from "~/utils/strings";

export const meta: MetaFunction = ({ data }: { data: UserPageLoaderData }) => {
  return {
    title: makeTitle(discordFullName(data)),
  };
};

export const handle = {
  i18n: "user",
};

export const userParamsSchema = z.object({ identifier: z.string() });

export type UserPageLoaderData = Pick<
  User,
  | "id"
  | "discordName"
  | "discordAvatar"
  | "discordDiscriminator"
  | "discordId"
  | "youtubeId"
  | "twitch"
  | "twitter"
  | "bio"
> & {
  country?: { emoji: string; code: string; name: string };
  badges: CountsByUserId;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const locale = await i18next.getLocale(request);
  const { identifier } = userParamsSchema.parse(params);
  const user = notFoundIfFalsy(db.users.findByIdentifier(identifier));

  const countryObj = user.country
    ? countries[user.country as keyof typeof countries]
    : undefined;

  return json<UserPageLoaderData>({
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
  });
};

export default function UserPageLayout() {
  const data = useLoaderData<UserPageLoaderData>();
  const user = useUser();
  const { t } = useTranslation();

  const isOwnPage = data.id === user?.id;

  return (
    <>
      <SubNav>
        <SubNavLink to="" data-cy="profile-page-link">
          {t("header.profile")}
        </SubNavLink>
        {isOwnPage ? (
          <SubNavLink to="edit" data-cy="edit-page-link">
            {t("actions.edit")}
          </SubNavLink>
        ) : null}
      </SubNav>
      <Main>
        <Outlet />
      </Main>
    </>
  );
}

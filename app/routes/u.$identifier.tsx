import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { countries } from "countries-list";
import { z } from "zod";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { db } from "~/db";
import type { User } from "~/db/types";
import { useUser } from "~/hooks/useUser";
import { notFoundIfFalsy } from "~/utils/remix";

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
> & { country?: { name: string; emoji: string; code: string } };

export const loader: LoaderFunction = ({ params }) => {
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
    country:
      countryObj && user.country
        ? {
            name: countryObj.name,
            emoji: countryObj.emoji,
            code: user.country,
          }
        : undefined,
  });
};

export default function UserPageLayout() {
  const data = useLoaderData<UserPageLoaderData>();
  const user = useUser();

  const isOwnPage = data.id === user?.id;

  return (
    <>
      <SubNav>
        <SubNavLink to="" data-cy="profile-page-link">
          Profile
        </SubNavLink>
        {isOwnPage ? (
          <SubNavLink to="edit" data-cy="edit-page-link">
            Edit
          </SubNavLink>
        ) : null}
      </SubNav>
      <Main>
        <Outlet />
      </Main>
    </>
  );
}

import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/db";
import { z } from "zod";
import type { User } from "~/db/types";
import { notFoundIfFalsy } from "~/utils/remix";
import { useLoaderData } from "@remix-run/react";
import { Avatar } from "~/components/Avatar";
import styles from "~/styles/u.css";
import { SocialLink } from "~/components/u/SocialLink";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const userParamsSchema = z.object({ identifier: z.string() });

type UserPageLoaderData = Pick<
  User,
  | "discordName"
  | "discordAvatar"
  | "discordDiscriminator"
  | "discordId"
  | "youtubeId"
  | "twitch"
  | "twitter"
>;

export const loader: LoaderFunction = ({ params }) => {
  const { identifier } = userParamsSchema.parse(params);
  const user = notFoundIfFalsy(db.users.findByIdentifier(identifier));

  return json<UserPageLoaderData>({
    discordAvatar: user.discordAvatar,
    discordDiscriminator: user.discordDiscriminator,
    discordId: user.discordId,
    discordName: user.discordName,
    twitch: user.twitch,
    twitter: user.twitter,
    youtubeId: user.youtubeId,
  });
};

export default function UserInfoPage() {
  const data = useLoaderData<UserPageLoaderData>();
  return (
    <div className="u__avatar-container">
      <Avatar
        discordAvatar={data.discordAvatar}
        discordId={data.discordId}
        size="lg"
        className="u__avatar"
      />
      <h2 className="u__name">
        {data.discordName}
        <span className="u__discriminator">#{data.discordDiscriminator}</span>
      </h2>
      <div className="u__socials">
        {data.twitch ? (
          <SocialLink type="twitch" identifier={data.twitch} />
        ) : null}
        {data.twitter ? (
          <SocialLink type="twitter" identifier={data.twitter} />
        ) : null}
        {data.youtubeId ? (
          <SocialLink type="youtube" identifier={data.youtubeId} />
        ) : null}
      </div>
    </div>
  );
}

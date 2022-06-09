import type { LinksFunction } from "@remix-run/node";
import { useMatches } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Avatar } from "~/components/Avatar";
import { SocialLink } from "~/components/u/SocialLink";
import styles from "~/styles/u.css";
import type { UserPageLoaderData } from "../u.$identifier";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function UserInfoPage() {
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const data = parentRoute.data as UserPageLoaderData;

  return (
    <div className="u__container">
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
        {data.country ? (
          <div className="u__country">
            <span className="u__country-emoji">{data.country.emoji}</span>{" "}
            <span className="u__country-name">{data.country.name}</span>
          </div>
        ) : null}
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
      {data.bio ? <article className="u__bio">{data.bio}</article> : null}
    </div>
  );
}

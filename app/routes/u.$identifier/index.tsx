import type { LinksFunction } from "@remix-run/node";
import { useMatches } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Avatar } from "~/components/Avatar";
import { SocialLink } from "~/components/u/SocialLink";
import styles from "~/styles/u.css";
import type { UserPageLoaderData } from "../u.$identifier";
import * as React from "react";
import type { Unpacked } from "~/utils/types";
import clsx from "clsx";

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
      <BadgeContainer badges={data.badges} />
      {data.bio ? <article className="u__bio">{data.bio}</article> : null}
    </div>
  );
}

function BadgeContainer(props: { badges: UserPageLoaderData["badges"] }) {
  const [badges, setBadges] = React.useState(props.badges);
  const [bigBadge, ...smallBadges] = badges;
  if (!bigBadge) return null;

  const setBadgeFirst = (badge: Unpacked<UserPageLoaderData["badges"]>) => {
    setBadges(
      badges.map((b, i) => {
        if (i === 0) return badge;
        if (b.code === badge.code) return badges[0]!;

        return b;
      })
    );
  };

  return (
    <div>
      <div
        className={clsx("u__badges", {
          "justify-center": smallBadges.length === 0,
        })}
      >
        <img
          key={bigBadge.code}
          src={`/gif/badges/${bigBadge.code}.gif`}
          alt={bigBadge.displayName}
          title={bigBadge.displayName}
          width="125"
          height="125"
        />
        {smallBadges.length > 0 ? (
          <div className="u__small-badges">
            {smallBadges.map((badge) => (
              <img
                key={badge.code}
                src={`/gif/badges/${badge.code}.gif`}
                alt={badge.displayName}
                title={badge.displayName}
                onClick={() => setBadgeFirst(badge)}
                width="48"
                height="48"
              />
            ))}
          </div>
        ) : null}
      </div>
      <div className="u__badge-explanation">
        {badgeExplanationText(bigBadge)}
      </div>
    </div>
  );
}

function badgeExplanationText(badge: Unpacked<UserPageLoaderData["badges"]>) {
  return `Awarded for winning ${badge.displayName}`;
}

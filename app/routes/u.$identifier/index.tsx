import type { LinksFunction } from "@remix-run/node";
import { useMatches } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Avatar } from "~/components/Avatar";
import styles from "~/styles/u.css";
import type { UserPageLoaderData } from "../u.$identifier";
import * as React from "react";
import type { Unpacked } from "~/utils/types";
import clsx from "clsx";
import { assertUnreachable } from "~/utils/types";
import { TwitchIcon } from "~/components/icons/Twitch";
import { TwitterIcon } from "~/components/icons/Twitter";
import { YouTubeIcon } from "~/components/icons/YouTube";
import { badgeExplanationText } from "../badges/$id";
import { Badge } from "~/components/Badge";

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

interface SocialLinkProps {
  type: "youtube" | "twitter" | "twitch";
  identifier: string;
}

export function SocialLink({
  type,
  identifier,
}: {
  type: "youtube" | "twitter" | "twitch";
  identifier: string;
}) {
  const href = () => {
    switch (type) {
      case "twitch":
        return `https://www.twitch.tv/${identifier}`;
      case "twitter":
        return `https://www.twitter.com/${identifier}`;
      case "youtube":
        return `https://www.youtube.com/channel/${identifier}`;
      default:
        assertUnreachable(type);
    }
  };

  return (
    <a
      className={clsx("u__social-link", {
        youtube: type === "youtube",
        twitter: type === "twitter",
        twitch: type === "twitch",
      })}
      href={href()}
    >
      <SocialLinkIcon type={type} />
    </a>
  );
}

function SocialLinkIcon({ type }: Pick<SocialLinkProps, "type">) {
  switch (type) {
    case "twitch":
      return <TwitchIcon />;
    case "twitter":
      return <TwitterIcon />;
    case "youtube":
      return <YouTubeIcon />;
    default:
      assertUnreachable(type);
  }
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
    <div data-cy="badge-container">
      <div
        className={clsx("u__badges", {
          "justify-center": smallBadges.length === 0,
        })}
      >
        <Badge badge={bigBadge} size={125} isAnimated />
        {smallBadges.length > 0 ? (
          <div className="u__small-badges">
            {smallBadges.map((badge) => (
              <div
                key={badge.id}
                className="u__small-badge-container"
                data-cy="small-badge"
              >
                <Badge
                  badge={badge}
                  onClick={() => setBadgeFirst(badge)}
                  size={48}
                  isAnimated
                />
                {badge.count > 1 ? (
                  <div className="u__small-badge-count">×{badge.count}</div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="u__badge-explanation" data-cy="badge-explanation">
        {badgeExplanationText(bigBadge)}
      </div>
    </div>
  );
}

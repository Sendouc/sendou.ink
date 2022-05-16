import clsx from "clsx";
import { assertUnreachable } from "~/utils/types";
import { TwitchIcon } from "../icons/Twitch";
import { TwitterIcon } from "../icons/Twitter";
import { YouTubeIcon } from "../icons/YouTube";

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

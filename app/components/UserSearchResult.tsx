import { USER_SEARCH_PAGE } from "~/utils/urls";
import { TwitterIcon } from "./icons/Twitter";

export function UserSearchResult({
  discordUsername,
  discordId,
  twitterHandle,
}: {
  discordUsername: string;
  discordId: number;
  twitterHandle?: string;
}) {
  const userPageHyperlink = `${USER_SEARCH_PAGE}/${discordId}`;

  //TODO: for Discord Avatar image, use a real image later
  const discordAvatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/1d1d8488ced4cdf478648592fa871101.webp?size=80`;

  return (
    <div className="u__search__container">
      {/* Left side, Discord avatar */}
      <a href={userPageHyperlink}>
        <span className="u__search_discord_avatar_wrapper">
          <img src={discordAvatarUrl} className="u__search_discord_avatar" />
        </span>
      </a>

      {/* Right side */}
      <div className="u__search_container_right">
        {/* Discord Username */}
        <div className="u__search_discord_container">
          <a className="u__search_hyperlink" href={userPageHyperlink}>
            {discordUsername}
          </a>
        </div>

        {/* Twitter */}
        {twitterHandle && (
          <div className="u__search_twitter_container">
            <TwitterIcon className="u__search_twitter-blue-icon" />
            <a
              className="u__search_hyperlink"
              href={`https://twitter.com/${twitterHandle}`}
            >
              {twitterHandle}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

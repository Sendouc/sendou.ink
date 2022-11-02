import { USER_SEARCH_PAGE } from "~/utils/urls";

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

  // Retrieves the string content before the '#' character in the full Discord username
  let discordAvatarAltText: string | undefined;
  const regexExtractDiscordNameWithoutIdentifier = new RegExp("^(.+?)#");
  const regexArray =
    regexExtractDiscordNameWithoutIdentifier.exec(discordUsername);
  if (regexArray !== null) {
    discordAvatarAltText = regexArray[0];
  }

  //TODO: for Discord Avatar image, use a real image later
  const discordAvatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/1d1d8488ced4cdf478648592fa871101.webp?size=80`;

  return (
    <div className="u__search__container">
      {/* Left side, Discord avatar */}
      <a href={userPageHyperlink}>
        <span className="u__search_discord_avatar_wrapper">
          <img
            src={discordAvatarUrl}
            alt={discordAvatarAltText}
            className="u__search_discord_avatar"
          />
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
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 512 512"
              className="u__search_twitter-blue-icon"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Minified Twitter SVG - courtesy of: https://codepen.io/elliz/pen/BpqVzG */}
              <path d="m492 110c-13 18-29 35-49 50c0 0 0 12 0 12c0 44-10 87-30 128c-21 41-53 76-96 104c-43 28-92 42-148 42c-55 0-104-14-149-43c5 1 13 1 24 1c45 0 85-13 120-40c-21-1-40-8-56-20c-17-12-28-28-34-48c3 1 9 2 17 2c9 0 18-1 26-3c-23-5-41-16-56-34c-14-18-21-38-21-61c0 0 0-1 0-1c12 6 27 11 43 12c-29-20-43-47-43-81c0-16 4-32 13-48c53 64 119 98 200 100c-2-6-3-13-3-21c0-27 9-50 28-68c19-19 42-28 69-28c28 0 51 9 70 29c20-4 41-11 61-22c-7 22-21 40-42 53c19-3 38-8 56-15" />
            </svg>
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

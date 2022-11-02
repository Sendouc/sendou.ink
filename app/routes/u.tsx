import { Main } from "~/components/Main";
import type { LinksFunction } from "@remix-run/node";
import styles from "~/styles/u.css";
import { useTranslation } from "react-i18next";
import { USER_SEARCH_PAGE } from "~/utils/urls";
import { TwitterIcon } from "~/components/icons/Twitter";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function UsersSearchPage() {
  const { t } = useTranslation("common");

  //TODO: add User Search ComboBox, specifically tailored for this page

  //TODO: get appropriate data from API
  const userData = {
    discordUsername: "Sendou#4059",
    discordId: 79237403620945920,
    twitterHandle: "Sendouc",
  };

  return (
    <Main className="stack lg">
      <h1>{t("actions.search")}</h1>
      <UserSearchResult
        discordUsername={userData.discordUsername}
        discordId={userData.discordId}
        twitterHandle={userData.twitterHandle}
      ></UserSearchResult>

      <UserSearchResult
        discordUsername={userData.discordUsername}
        discordId={userData.discordId}
      ></UserSearchResult>
    </Main>
  );
}

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

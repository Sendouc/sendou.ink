import { Main } from "~/components/Main";
import type { LinksFunction } from "@remix-run/node";
import styles from "~/styles/u.css";
import { useTranslation } from "react-i18next";
import { UserSearchResult } from "~/components/UserSearchResult";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function UsersSearchPage() {
  const { t } = useTranslation("common");

  //TODO: get data from API
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
    </Main>
  );
}

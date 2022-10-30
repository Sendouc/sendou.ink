import { Outlet } from "@remix-run/react";
import { Main } from "~/components/Main";
import { db } from "~/db";
import type { LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { mostRecentArticles } from "~/modules/articles";
import styles from "~/styles/front.css";
import { ArticlesPeek } from ".";
import { useTranslation } from "react-i18next";

const MAX_ARTICLES_COUNT = 100;

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

/**
 * Copied from apps/routes/index.tsx. I can't import this without the functionality breaking
 */
export const loader = async () => {
  return json({
    upcomingEvents: db.calendarEvents.upcomingEvents(),
    recentBuilds: db.builds.recentBuilds(),
    recentWinners: db.calendarEvents.recentWinners(),
    recentArticles: await mostRecentArticles(MAX_ARTICLES_COUNT),
  });
};

export default function ArticlesMainPage() {
  const { t } = useTranslation("front");

  return (
    <Main className="stack lg">
      <Outlet />

      <h1>{t("articlesGoTo")}</h1>
      <ArticlesPeek />
    </Main>
  );
}

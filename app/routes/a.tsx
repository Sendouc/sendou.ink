import { Outlet, useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import type { LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { mostRecentArticles } from "~/modules/articles";
import styles from "~/styles/front.css";
import { ArticlesPeek } from ".";
import { useTranslation } from "react-i18next";
import type { SendouRouteHandle } from "~/utils/remix";

const MAX_ARTICLES_COUNT = 100;

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["front"],
};

export const loader = async () => {
  return json({
    recentArticles: await mostRecentArticles(MAX_ARTICLES_COUNT),
  });
};

export default function ArticlesMainPage() {
  const { t } = useTranslation("common");
  const data = useLoaderData<typeof loader>();
  const articles = data.recentArticles;

  return (
    <Main className="stack lg">
      <Outlet />

      <h1>{t("pages.articles")}</h1>
      <ArticlesPeek articles={articles} />
    </Main>
  );
}

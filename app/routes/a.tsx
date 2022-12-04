import { Main } from "~/components/Main";
import type { LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { mostRecentArticles } from "~/modules/articles";
import styles from "~/styles/front.css";
import { useTranslation } from "~/hooks/useTranslation";
import type { SendouRouteHandle } from "~/utils/remix";
import { articlePage, ARTICLES_MAIN_PAGE, navIconUrl } from "~/utils/urls";
import { Link, useLoaderData } from "@remix-run/react";

const MAX_ARTICLES_COUNT = 100;

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["front"],
  breadcrumb: () => ({
    imgPath: navIconUrl("articles"),
    href: ARTICLES_MAIN_PAGE,
    type: "IMAGE",
  }),
};

export const loader = async () => {
  return json({
    articles: await mostRecentArticles(MAX_ARTICLES_COUNT),
  });
};

export default function ArticlesMainPage() {
  const { t } = useTranslation(["common"]);
  const data = useLoaderData<typeof loader>();

  return (
    <Main className="stack lg">
      <ul className="articles-list">
        {data.articles.map((article) => (
          <li key={article.title}>
            <Link
              to={articlePage(article.slug)}
              className="articles-list__title"
            >
              {article.title}
            </Link>
            <div className="text-xs text-lighter">
              {t("common:articles.by", { author: article.author })} •{" "}
              <time>{article.dateString}</time>
            </div>
          </li>
        ))}
      </ul>
    </Main>
  );
}

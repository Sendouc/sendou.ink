import { json, type LinksFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { BuildCard } from "~/components/BuildCard";
import { ArrowRightIcon } from "~/components/icons/ArrowRight";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { db } from "~/db";
import { useIsMounted } from "~/hooks/useIsMounted";
import { mostRecentArticles } from "~/modules/articles";
import styles from "~/styles/front.css";
import { databaseTimestampToDate } from "~/utils/dates";
import { discordFullName } from "~/utils/strings";
import {
  analyzerPage,
  articlePage,
  ARTICLES_MAIN_PAGE,
  BADGES_PAGE,
  BUILDS_PAGE,
  calendarEventPage,
  CALENDAR_PAGE,
  mapsPage,
  navIconUrl,
  objectDamageCalculatorPage,
  plusSuggestionPage,
  userPage,
} from "~/utils/urls";
import { Tags } from "./calendar/components/Tags";
import { type SendouRouteHandle } from "~/utils/remix";

const RECENT_ARTICLES_TO_SHOW = 3;

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["weapons", "builds", "front"],
};

export const loader = async () => {
  return json({
    upcomingEvents: db.calendarEvents.upcomingEvents(),
    recentBuilds: db.builds.recentBuilds(),
    recentWinners: db.calendarEvents.recentWinners(),
    recentArticles: await mostRecentArticles(RECENT_ARTICLES_TO_SHOW),
  });
};

export default function Index() {
  const { t } = useTranslation(["common", "front"]);
  const data = useLoaderData<typeof loader>();
  const articles = data.recentArticles;

  return (
    <Main className="stack lg">
      <Header />
      <div className="stack md">
        <BuildsPeek />
        <GoToPageBanner to={BUILDS_PAGE} navItem="builds">
          {t("front:buildsGoTo")}
        </GoToPageBanner>
      </div>
      <div className="stack md">
        <CalendarPeek />
        <GoToPageBanner to={CALENDAR_PAGE} navItem="calendar">
          {t("front:calendarGoTo")}
        </GoToPageBanner>
      </div>
      <ArticlesPeek articles={articles} />
      <GoToPageBanner to={ARTICLES_MAIN_PAGE} navItem="sendou_love">
        {t("front:articlesGoTo")}
      </GoToPageBanner>
      <div className="stack md">
        <h2 className="front__more-features">{t("front:moreFeatures")}</h2>
        <div className="front__feature-cards">
          <FeatureCard
            navItem="analyzer"
            title={t("common:pages.analyzer")}
            description={t("front:analyzer.description")}
            to={analyzerPage()}
          />
          <FeatureCard
            navItem="object-damage-calculator"
            title={t("common:pages.object-damage-calculator")}
            description={t("front:object-damage-calculator.description")}
            to={objectDamageCalculatorPage()}
          />
          <FeatureCard
            navItem="plus"
            title={t("common:pages.plus")}
            description={t("front:plus.description")}
            to={plusSuggestionPage()}
          />
          <FeatureCard
            navItem="badges"
            title={t("common:pages.badges")}
            description={t("front:badges.description")}
            to={BADGES_PAGE}
          />
          <FeatureCard
            navItem="maps"
            title={t("common:pages.maps")}
            description={t("front:maps.description")}
            to={mapsPage()}
          />
        </div>
      </div>
    </Main>
  );
}

function Header() {
  const { t } = useTranslation("front");

  return (
    <div className="front__logo-container">
      <h1>sendou.ink</h1>
      <h2>{t("websiteSubtitle")}</h2>
    </div>
  );
}

function GoToPageBanner({
  children,
  to,
  navItem,
}: {
  children: React.ReactNode;
  to: string;
  navItem: string;
}) {
  return (
    <Link to={to} className="front__go-to-page-banner">
      <div className="front__go-to-page-banner__nav-img-container">
        <Image
          path={navIconUrl(navItem)}
          alt={navItem}
          width={32}
          height={32}
        />
      </div>
      {children}
      <ArrowRightIcon className="front__go-to-page-banner__arrow-right" />
    </Link>
  );
}

function BuildsPeek() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="front__builds-wrapper">
      <div className="builds-container front__builds-container">
        {data.recentBuilds.map((build) => (
          <BuildCard
            key={build.id}
            build={build}
            owner={build}
            canEdit={false}
          />
        ))}
      </div>
    </div>
  );
}

function CalendarPeek() {
  const data = useLoaderData<typeof loader>();
  const { t, i18n } = useTranslation("front");

  return (
    <div className="front__calendar-peek-container">
      <div className="stack sm">
        <h2 className="front__calendar-header">{t("recentWinners")}</h2>
        {data.recentWinners.map((result) => (
          <Event
            key={result.eventId}
            eventId={result.eventId}
            eventName={result.eventName}
            startTimeString={databaseTimestampToDate(
              result.startTime
            ).toLocaleDateString(i18n.language, {
              day: "numeric",
              month: "long",
            })}
          >
            <ul className="front__event-winners">
              {result.players.map((player) => (
                <li
                  key={typeof player === "string" ? player : player.id}
                  className="flex items-center"
                >
                  {typeof player === "string" ? (
                    player
                  ) : (
                    <Link
                      to={userPage(player)}
                      className="stack horizontal xs items-center"
                    >
                      {discordFullName(player)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </Event>
        ))}
      </div>
      <div className="stack sm">
        <h2 className="front__calendar-header">{t("upcomingEvents")}</h2>
        {data.upcomingEvents.map((event) => (
          <Event
            key={event.eventId}
            eventId={event.eventId}
            eventName={event.eventName}
            startTimeString={databaseTimestampToDate(
              event.startTime
            ).toLocaleString(i18n.language, {
              day: "numeric",
              month: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          >
            <Tags tags={event.tags} badges={event.badgePrizes} />
          </Event>
        ))}
      </div>
    </div>
  );
}

function Event({
  eventId,
  eventName,
  startTimeString,
  children,
}: {
  eventId: number;
  eventName: string;
  startTimeString: string;
  children: React.ReactNode;
}) {
  const isMounted = useIsMounted();

  return (
    <div className="front__event">
      <Link to={calendarEventPage(eventId)} className="front__event-name">
        {eventName}
      </Link>
      {isMounted && <div className="front__event-time">{startTimeString}</div>}
      <div className="front__event-content-below">{children}</div>
    </div>
  );
}

export function ArticlesPeek({
  articles,
}: {
  articles: SerializeObject<
    Simplify<
      {
        title: string;
        author: string;
        slug: string;
        dateString: string;
      } & {}
    >
  >[];
}) {
  const { t } = useTranslation("front");

  return (
    <ul className="front__articles">
      {articles.map((article) => (
        <li key={article.title}>
          <Link to={articlePage(article.slug)}>{article.title}</Link>
          <div className="text-xs text-lighter">
            {t("articleBy", { author: article.author })} •{" "}
            <time>{article.dateString}</time>
          </div>
        </li>
      ))}
    </ul>
  );
}

function FeatureCard({
  navItem,
  title,
  description,
  to,
}: {
  navItem: string;
  title: string;
  description: string;
  to: string;
}) {
  return (
    <Link to={to} className="front__feature-card">
      <Image
        path={navIconUrl(navItem)}
        alt={navItem}
        width={48}
        height={48}
        className="front__feature-card__nav-icon"
      />
      <h3 className="front__feature-card__title">{title}</h3>
      <div className="front__feature-card__description">{description}</div>
    </Link>
  );
}

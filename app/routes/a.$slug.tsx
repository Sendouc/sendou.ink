import Markdown from "markdown-to-jsx";
import { Main } from "~/components/Main";
import {
  json,
  type SerializeFrom,
  type LoaderArgs,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import * as React from "react";
import { articleBySlug } from "~/modules/articles";
import invariant from "tiny-invariant";
import { makeTitle } from "~/utils/strings";
import {
  articlePreviewUrl,
  ARTICLES_MAIN_PAGE,
  navIconUrl,
} from "~/utils/urls";
import type { SendouRouteHandle } from "~/utils/remix";
import { notFoundIfFalsy } from "~/utils/remix";

export const handle: SendouRouteHandle = {
  breadcrumb: ({ match }) => {
    const data = match.data as SerializeFrom<typeof loader>;
    return [
      {
        imgPath: navIconUrl("articles"),
        href: ARTICLES_MAIN_PAGE,
        type: "IMAGE",
      },
      {
        text: data.title,
        // xxx: fix ARTICLES_MAIN_PAGE
        href: ARTICLES_MAIN_PAGE,
        type: "TEXT",
      },
    ];
  },
};

export const meta: MetaFunction = (args) => {
  invariant(args.params["slug"]);
  const data = args.data as SerializeFrom<typeof loader> | null;

  if (!data) return {};

  const description = data.content.trim().split("\n")[0];

  return {
    title: makeTitle(data.title),
    "og:title": data.title,
    description,
    "og:description": description,
    "twitter:card": "summary_large_image",
    "og:image": articlePreviewUrl(args.params["slug"]),
    "og:type": "article",
    "og:site_name": "sendou.ink",
  };
};

export const loader = ({ params }: LoaderArgs) => {
  invariant(params["slug"]);

  return json(notFoundIfFalsy(articleBySlug(params["slug"])));
};

export default function ArticlePage() {
  const data = useLoaderData<typeof loader>();
  return (
    <Main>
      <article className="article">
        <h1>{data.title}</h1>
        <div className="text-sm text-lighter">
          by <Author /> • <time>{data.dateString}</time>
        </div>
        <Markdown options={{ wrapper: React.Fragment }}>
          {data.content}
        </Markdown>
      </article>
    </Main>
  );
}

function Author() {
  const data = useLoaderData<typeof loader>();

  if (data.authorLink) {
    return <a href={data.authorLink}>{data.author}</a>;
  }

  return <>{data.author}</>;
}

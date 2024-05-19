import { Main } from "~/components/Main";
import { useFetcher, useLoaderData } from "@remix-run/react";
import type { MetaFunction, SerializeFrom } from "@remix-run/node";
import { LFGPost } from "../components/LFGPost";
import { LFG_PAGE, lfgNewPostPage, navIconUrl } from "~/utils/urls";
import type { SendouRouteHandle } from "~/utils/remix";
import React from "react";
import { LinkButton } from "~/components/Button";
import { useUser } from "~/features/auth/core/user";
import { Alert } from "~/components/Alert";
import type { Unpacked } from "~/utils/types";
import { add, sub } from "date-fns";
import { databaseTimestampToDate } from "~/utils/dates";
import { LFG } from "../lfg-constants";
import { SubmitButton } from "~/components/SubmitButton";
import type { LFGFilter } from "../lfg-types";
import { filterPosts } from "../core/filtering";
import { LFGAddFilterButton } from "../components/LFGAddFilterButton";
import { LFGFilters } from "../components/LFGFilters";
import { makeTitle } from "~/utils/strings";
import { useTranslation } from "react-i18next";

import { loader } from "../loaders/lfg.server";
import { action } from "../actions/lfg.server";
export { loader, action };

import "../lfg.css";

export const handle: SendouRouteHandle = {
  i18n: ["lfg"],
  breadcrumb: () => ({
    imgPath: navIconUrl("lfg"),
    href: LFG_PAGE,
    type: "IMAGE",
  }),
};

export const meta: MetaFunction = () => {
  return [{ title: makeTitle("Looking for group") }];
};

export type LFGLoaderData = SerializeFrom<typeof loader>;
export type LFGLoaderPost = Unpacked<LFGLoaderData["posts"]>;
export type TiersMap = ReturnType<typeof unserializeTiers>;

const unserializeTiers = (data: SerializeFrom<typeof loader>) =>
  new Map(data.tiersMap);

// xxx: e2e test

export default function LFGPage() {
  const { t } = useTranslation(["common, lfg"]);
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const [filters, setFilters] = React.useState<LFGFilter[]>([]);

  const tiersMap = React.useMemo(() => unserializeTiers(data), [data]);

  const filteredPosts = filterPosts(data.posts, filters, tiersMap);

  const showExpiryAlert = (post: Unpacked<LFGLoaderData["posts"]>) => {
    if (post.author.id !== user?.id) return false;

    const expiryDate = add(databaseTimestampToDate(post.updatedAt), {
      days: LFG.POST_FRESHNESS_DAYS,
    });
    const expiryCloseDate = sub(expiryDate, { days: 7 });

    if (new Date() < expiryCloseDate) return false;

    return true;
  };

  return (
    <Main className="stack xl">
      <div className="stack horizontal justify-between">
        <LFGAddFilterButton
          addFilter={(newFilter) => setFilters([...filters, newFilter])}
          filters={filters}
        />
        {user && (
          <div className="stack sm horizontal items-center justify-end">
            <LinkButton to={lfgNewPostPage()} size="tiny">
              {t("common:actions.addNew")}
            </LinkButton>
          </div>
        )}
      </div>
      <LFGFilters
        filters={filters}
        changeFilter={(newFilter) =>
          setFilters(
            filters.map((filter) =>
              filter._tag === newFilter._tag ? newFilter : filter,
            ),
          )
        }
        removeFilterByTag={(tag) =>
          setFilters(filters.filter((filter) => filter._tag !== tag))
        }
      />
      {filteredPosts.map((post) => (
        <div key={post.id} className="stack sm">
          {showExpiryAlert(post) ? <PostExpiryAlert postId={post.id} /> : null}
          <LFGPost post={post} tiersMap={tiersMap} />
        </div>
      ))}
      {filteredPosts.length === 0 ? (
        <div className="text-lighter text-lg font-semi-bold text-center mt-6">
          {t("lfg:noPosts")}
        </div>
      ) : null}
    </Main>
  );
}

function PostExpiryAlert({ postId }: { postId: number }) {
  const { t } = useTranslation(["common", "lfg"]);
  const fetcher = useFetcher();

  return (
    <Alert variation="WARNING">
      <fetcher.Form method="post" className="stack md horizontal items-center">
        <input type="hidden" name="id" value={postId} />
        {t("lfg:expiring")}{" "}
        <SubmitButton _action="BUMP_POST" variant="outlined" size="tiny">
          {t("common:actions.clickHere")}
        </SubmitButton>
      </fetcher.Form>
    </Alert>
  );
}

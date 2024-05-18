import { Main } from "~/components/Main";
import { useFetcher, useLoaderData } from "@remix-run/react";
import type { SerializeFrom } from "@remix-run/node";
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

export type LFGLoaderData = SerializeFrom<typeof loader>;
export type TiersMap = ReturnType<typeof unserializeTiers>;

const unserializeTiers = (data: SerializeFrom<typeof loader>) =>
  new Map(data.tiersMap);

// xxx: +1/+2/+3 visibility

export default function LFGPage() {
  const user = useUser();
  const data = useLoaderData<typeof loader>();

  const tiersMap = React.useMemo(() => unserializeTiers(data), [data]);

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
      {user && (
        <div className="stack sm horizontal items-center justify-end">
          <LinkButton to={lfgNewPostPage()} size="tiny">
            Add new
          </LinkButton>
        </div>
      )}
      {data.posts.map((post) => (
        <div key={post.id} className="stack sm">
          {showExpiryAlert(post) ? <PostExpiryAlert postId={post.id} /> : null}
          <LFGPost post={post} tiersMap={tiersMap} />
        </div>
      ))}
      {data.posts.length === 0 ? (
        <div className="text-lighter text-lg font-semi-bold text-center mt-6">
          No posts matching the filter
        </div>
      ) : null}
    </Main>
  );
}

function PostExpiryAlert({ postId }: { postId: number }) {
  const fetcher = useFetcher();

  return (
    <Alert variation="WARNING">
      <fetcher.Form method="post" className="stack md horizontal items-center">
        <input type="hidden" name="id" value={postId} />
        Post is expiring. Still looking?{" "}
        <SubmitButton _action="BUMP_POST" variant="outlined" size="tiny">
          Click here
        </SubmitButton>
      </fetcher.Form>
    </Alert>
  );
}

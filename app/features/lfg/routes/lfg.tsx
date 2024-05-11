import { Main } from "~/components/Main";
import { useLoaderData } from "@remix-run/react";
import type { SerializeFrom } from "@remix-run/node";
import { LFGPost } from "../components/LFGPost";
import { LFG_PAGE, navIconUrl } from "~/utils/urls";
import type { SendouRouteHandle } from "~/utils/remix";
import React from "react";

import { loader } from "../loaders/lfg.server";
export { loader };

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
  const data = useLoaderData<typeof loader>();

  const tiersMap = React.useMemo(() => unserializeTiers(data), [data]);

  return (
    <Main className="stack lg">
      {data.posts.map((post) => (
        <LFGPost key={post.id} post={post} tiersMap={tiersMap} />
      ))}
    </Main>
  );
}

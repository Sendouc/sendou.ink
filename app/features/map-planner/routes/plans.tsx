import { lazy } from "react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import styles from "../plans.css";
import type { SendouRouteHandle } from "~/utils/remix";
import { useIsMounted } from "~/hooks/useIsMounted";
import { navIconUrl, PLANNER_URL } from "~/utils/urls";
import { makeTitle } from "~/utils/strings";
import { useTranslation } from "~/hooks/useTranslation";
import { useSetTitle } from "~/hooks/useSetTitle";

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Planner"),
    description:
      "Make the perfect Splatoon 3 battle plans by drawing on maps and adding weapon images",
  };
};

export const handle: SendouRouteHandle = {
  i18n: ["weapons"],
  breadcrumb: () => ({
    imgPath: navIconUrl("plans"),
    href: PLANNER_URL,
    type: "IMAGE",
  }),
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const Planner = lazy(() => import("~/features/map-planner/components/Planner"));

export default function MapPlannerPage() {
  const { t } = useTranslation(["common"]);
  const isMounted = useIsMounted();
  useSetTitle(t("common:pages.plans"));

  if (!isMounted) return <div className="plans__placeholder" />;

  return <Planner />;
}

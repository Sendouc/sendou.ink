import { lazy } from "react";
import type { LinksFunction } from "@remix-run/node";
import styles from "~/styles/plans.css";
import type { SendouRouteHandle } from "~/utils/remix";
import { useIsMounted } from "~/hooks/useIsMounted";
import { navIconUrl, PLANNER_URL } from "~/utils/urls";

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

const Planner = lazy(() => import("~/components/Planner"));

export default function MapPlannerPage() {
  const isMounted = useIsMounted();

  if (!isMounted) return <div className="plans__placeholder" />;

  return <Planner />;
}

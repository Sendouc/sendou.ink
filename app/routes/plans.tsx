import { lazy, Suspense } from "react";
import type { LinksFunction } from "@remix-run/node";
import styles from "~/styles/plans.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const Planner = lazy(() => import("~/components/Planner"));

export default function MapPlannerPage() {
  return (
    <Suspense fallback={null}>
      <Planner />
    </Suspense>
  );
}

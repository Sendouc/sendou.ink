import type { MetaFunction } from "@remix-run/node";
import { lazy } from "react";
import { useTranslation } from "react-i18next";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useSetTitle } from "~/hooks/useSetTitle";
import type { SendouRouteHandle } from "~/utils/remix.server";
import { makeTitle } from "~/utils/strings";
import { PLANNER_URL, navIconUrl } from "~/utils/urls";

import "../plans.css";

export const meta: MetaFunction = () => {
	return [
		{ title: makeTitle("Planner") },
		{
			name: "description",
			content:
				"Make the perfect Splatoon 3 battle plans by drawing on maps and adding weapon images",
		},
	];
};

export const handle: SendouRouteHandle = {
	i18n: ["weapons"],
	breadcrumb: () => ({
		imgPath: navIconUrl("plans"),
		href: PLANNER_URL,
		type: "IMAGE",
	}),
};

const Planner = lazy(() => import("~/features/map-planner/components/Planner"));

export default function MapPlannerPage() {
	const { t } = useTranslation(["common"]);
	const isMounted = useIsMounted();
	useSetTitle(t("common:pages.plans"));

	if (!isMounted) return <div className="plans__placeholder" />;

	return <Planner />;
}

import { useLoaderData, useMatches } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { LinkButton } from "~/components/Button";
import { Popover } from "~/components/Popover";
import { useUser } from "~/features/auth/core/user";
import { VodListing } from "~/features/vods/components/VodListing";
import invariant from "~/utils/invariant";
import type { SendouRouteHandle } from "~/utils/remix";
import { newVodPage } from "~/utils/urls";
import type { UserPageLoaderData } from "./u.$identifier";

import { loader } from "../loaders/u.$identifier.vods.server";
export { loader };

import "~/features/vods/vods.css";

export const handle: SendouRouteHandle = {
	i18n: ["vods"],
};

export default function UserVodsPage() {
	const user = useUser();
	const [, parentRoute] = useMatches();
	invariant(parentRoute);
	const layoutData = parentRoute.data as UserPageLoaderData;
	const data = useLoaderData<typeof loader>();

	return (
		<div className="vods__listing__list">
			{layoutData.user.id === user?.id ? (
				<div className="stack items-end w-full">
					<AddVodButton isVideoAdder={user.isVideoAdder} />
				</div>
			) : null}
			{data.vods.map((vod) => (
				<VodListing key={vod.id} vod={vod} showUser={false} />
			))}
		</div>
	);
}

function AddVodButton({ isVideoAdder }: { isVideoAdder: number | null }) {
	const { t } = useTranslation(["vods"]);

	if (!isVideoAdder) {
		return (
			<Popover
				buttonChildren={t("vods:addVod")}
				triggerClassName="tiny"
				containerClassName="text-center"
			>
				{t("vods:gainPerms")}
			</Popover>
		);
	}

	return (
		<LinkButton to={newVodPage()} size="tiny" className="whitespace-nowrap">
			{t("vods:addVod")}
		</LinkButton>
	);
}

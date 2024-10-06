import { useNavigate } from "@remix-run/react";
import * as React from "react";
import { useUser } from "~/features/auth/core/user";
import { navIconUrl, userNewBuildPage } from "~/utils/urls";
import { Menu, type MenuProps } from "../Menu";
import { PlusIcon } from "../icons/Plus";

const FilterMenuButton = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
	return (
		<button className="layout__header__button" {...props} ref={ref}>
			<PlusIcon className="layout__header__button__icon" />
		</button>
	);
});

// xxx: handle not allowed to add

// xxx: remove adding from other places?

export function AnythingAdder() {
	const user = useUser();
	const navigate = useNavigate();

	if (!user) {
		return null;
	}

	const items: MenuProps["items"] = [
		{
			id: "tournament",
			text: "Tournament",
			imagePath: navIconUrl("medal"),
			onClick: () => navigate(userNewBuildPage(user)),
		},
		{
			id: "calendarEvent",
			text: "Calendar event",
			imagePath: navIconUrl("calendar"),
			onClick: () => navigate(userNewBuildPage(user)),
		},
		{
			id: "builds",
			text: "Build",
			imagePath: navIconUrl("builds"),
			onClick: () => navigate(userNewBuildPage(user)),
		},
		{
			id: "team",
			text: "Team",
			imagePath: navIconUrl("t"),
			onClick: () => navigate(userNewBuildPage(user)),
		},
		{
			id: "lfgPost",
			text: "LFG post",
			imagePath: navIconUrl("lfg"),
			onClick: () => navigate(userNewBuildPage(user)),
		},
		{
			id: "art",
			text: "Art",
			imagePath: navIconUrl("art"),
			onClick: () => navigate(userNewBuildPage(user)),
		},
		{
			id: "vods",
			text: "VoD",
			imagePath: navIconUrl("vods"),
			onClick: () => navigate(userNewBuildPage(user)),
		},
		{
			id: "plus",
			text: "Plus suggestion",
			imagePath: navIconUrl("plus"),
			onClick: () => navigate(userNewBuildPage(user)),
		},
	];

	return <Menu items={items} button={FilterMenuButton} opensLeft />;
}

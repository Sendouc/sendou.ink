import { useNavigate } from "@remix-run/react";
import * as React from "react";
import { useUser } from "~/features/auth/core/user";
import {
	CALENDAR_NEW_PAGE,
	NEW_TEAM_PAGE,
	TOURNAMENT_NEW_PAGE,
	lfgNewPostPage,
	navIconUrl,
	newArtPage,
	newVodPage,
	plusSuggestionsNewPage,
	userNewBuildPage,
} from "~/utils/urls";
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
			onClick: () => navigate(TOURNAMENT_NEW_PAGE),
		},
		{
			id: "calendarEvent",
			text: "Calendar event",
			imagePath: navIconUrl("calendar"),
			onClick: () => navigate(CALENDAR_NEW_PAGE),
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
			onClick: () => navigate(NEW_TEAM_PAGE),
		},
		{
			id: "lfgPost",
			text: "LFG post",
			imagePath: navIconUrl("lfg"),
			onClick: () => navigate(lfgNewPostPage()),
		},
		{
			id: "art",
			text: "Art",
			imagePath: navIconUrl("art"),
			onClick: () => navigate(newArtPage()),
		},
		{
			id: "vods",
			text: "VoD",
			imagePath: navIconUrl("vods"),
			onClick: () => navigate(newVodPage()),
		},
		{
			id: "plus",
			text: "Plus suggestion",
			imagePath: navIconUrl("plus"),
			onClick: () => navigate(plusSuggestionsNewPage()),
		},
	];

	return <Menu items={items} button={FilterMenuButton} opensLeft />;
}

import { type MetaFunction, Outlet } from "react-router";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { plusSuggestionPage } from "~/features/plus-suggestions/plus-suggestions-urls";
import { metaTags, ogPageImage } from "~/utils/remix";
import type { SendouRouteHandle } from "~/utils/remix.server";
import {
	navIconUrl,
	PLUS_SUGGESTIONS_PAGE,
	PLUS_VOTING_PAGE,
	PLUS_VOTING_RESULTS_PAGE,
} from "~/utils/urls";

export const meta: MetaFunction = (args) => {
	return metaTags({
		title: "Plus Server",
		image: ogPageImage("plus"),
		location: args.location,
	});
};

export const handle: SendouRouteHandle = {
	navItemName: "plus",
	breadcrumb: () => ({
		imgPath: navIconUrl("plus"),
		href: plusSuggestionPage(),
		type: "IMAGE",
	}),
};

export default function PlusPageLayout() {
	return (
		<Main className="stack md">
			<SubNav>
				<SubNavLink to={PLUS_SUGGESTIONS_PAGE}>Suggestions</SubNavLink>
				<SubNavLink to={PLUS_VOTING_RESULTS_PAGE}>Results</SubNavLink>
				<SubNavLink to={PLUS_VOTING_PAGE}>Voting</SubNavLink>
			</SubNav>
			<Outlet />
		</Main>
	);
}

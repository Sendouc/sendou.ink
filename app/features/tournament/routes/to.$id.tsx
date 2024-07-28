import type {
	LoaderFunctionArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/node";
import {
	Outlet,
	type ShouldRevalidateFunction,
	useLoaderData,
	useLocation,
	useOutletContext,
} from "@remix-run/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { useUser } from "~/features/auth/core/user";
import { getUser } from "~/features/auth/core/user.server";
import { Tournament } from "~/features/tournament-bracket/core/Tournament";
import { tournamentDataCached } from "~/features/tournament-bracket/core/Tournament.server";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import { type SendouRouteHandle, notFoundIfFalsy } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import {
	tournamentOrganizationPage,
	tournamentPage,
	userSubmittedImage,
} from "~/utils/urls";
import { tournamentIdFromParams } from "../tournament-utils";

import "../tournament.css";
import "~/styles/maps.css";
import "~/styles/calendar-event.css";

// xxx: make never revalidate
export const shouldRevalidate: ShouldRevalidateFunction = (args) => {
	const navigatedToMatchPage =
		typeof args.nextParams.mid === "string" && args.formMethod !== "POST";

	if (navigatedToMatchPage) return false;

	return args.defaultShouldRevalidate;
};

export const meta: MetaFunction = (args) => {
	const data = args.data as SerializeFrom<typeof loader>;

	if (!data) return [];

	const title = makeTitle(data.tournamentNew.name);

	return [
		{ title },
		{
			property: "og:title",
			content: title,
		},
		{
			property: "og:description",
			// xxx: strip markdown?
			content: data.tournamentNew.description,
		},
		{
			property: "og:type",
			content: "website",
		},
		{
			property: "og:image",
			content: data.tournamentNew.logoSrc,
		},
		// Twitter special snowflake tags, see https://developer.x.com/en/docs/twitter-for-websites/cards/overview/summary
		{
			name: "twitter:card",
			content: "summary",
		},
		{
			name: "twitter:title",
			content: title,
		},
		{
			name: "twitter:site",
			content: "@sendouink",
		},
	];
};

export const handle: SendouRouteHandle = {
	i18n: ["tournament", "calendar"],
	breadcrumb: ({ match }) => {
		const data = match.data as TournamentLoaderData | undefined;

		if (!data) return [];

		return [
			data.tournamentNew.organization?.avatarUrl
				? {
						imgPath: userSubmittedImage(
							data.tournamentNew.organization.avatarUrl,
						),
						href: tournamentOrganizationPage({
							organizationSlug: data.tournamentNew.organization.slug,
						}),
						type: "IMAGE" as const,
						text: "",
						rounded: true,
					}
				: null,
			{
				imgPath: data.tournamentNew.logoSrc,
				href: tournamentPage(data.tournamentNew.id),
				type: "IMAGE" as const,
				text: data.tournamentNew.name,
				rounded: true,
			},
		].filter((crumb) => crumb !== null);
	},
};

export type TournamentLoaderData = SerializeFrom<typeof loader>;

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const user = await getUser(request);
	const tournamentId = tournamentIdFromParams(params);

	const tournament = await tournamentDataCached({ tournamentId, user });

	return {
		// xxx: remove
		tournament,
		// streamingParticipants: streams.flatMap((s) => (s.userId ? [s.userId] : [])),
		// xxx: remove, resolve directly in the brackets loader: isStreamed: boolean
		streamingParticipants: [] as number[],
		// xxx: rename
		tournamentNew: notFoundIfFalsy(
			await TournamentRepository.basicInfoById(tournamentId),
		),
	};
};

const TournamentContext = React.createContext<Tournament>(null!);

export default function TournamentLayout() {
	const { t } = useTranslation(["tournament"]);
	const user = useUser();
	const data = useLoaderData<typeof loader>();
	const location = useLocation();
	const tournament = React.useMemo(
		() => new Tournament(data.tournament),
		[data],
	);
	const [bracketExpanded, setBracketExpanded] = React.useState(true);

	// this is nice to debug with tournament in browser console
	if (process.env.NODE_ENV === "development") {
		React.useEffect(() => {
			// @ts-expect-error for dev purposes
			window.tourney = tournament;
		}, [tournament]);
	}

	const onBracketsPage = location.pathname.includes("brackets");

	return (
		<Main bigger={onBracketsPage}>
			<SubNav>
				<SubNavLink to="register" data-testid="register-tab" prefetch="intent">
					{data.tournamentNew.hasStarted
						? "Info"
						: t("tournament:tabs.register")}
				</SubNavLink>
				<SubNavLink to="brackets" data-testid="brackets-tab" prefetch="render">
					{t("tournament:tabs.brackets")}
				</SubNavLink>
				<SubNavLink to="teams" end={false} prefetch="render">
					{t("tournament:tabs.teams", { count: tournament.ctx.teams.length })}
				</SubNavLink>
				{!tournament.everyBracketOver && tournament.subsFeatureEnabled && (
					<SubNavLink to="subs" end={false}>
						{t("tournament:tabs.subs", { count: data.tournamentNew.subsCount })}
					</SubNavLink>
				)}
				{data.tournamentNew.hasStarted && !tournament.everyBracketOver ? (
					<SubNavLink to="streams">{t("tournament:tabs.streams")}</SubNavLink>
				) : null}
				{tournament.isOrganizer(user) && !data.tournamentNew.hasStarted && (
					<SubNavLink to="seeds">{t("tournament:tabs.seeds")}</SubNavLink>
				)}
				{tournament.isOrganizer(user) && !tournament.everyBracketOver && (
					<SubNavLink to="admin" data-testid="admin-tab">
						{t("tournament:tabs.admin")}
					</SubNavLink>
				)}
			</SubNav>
			<TournamentContext.Provider value={tournament}>
				<Outlet
					context={
						{
							tournament,
							tournamentNew: data.tournamentNew,
							bracketExpanded,
							setBracketExpanded,
							streamingParticipants: data.streamingParticipants,
						} satisfies TournamentContext
					}
				/>
			</TournamentContext.Provider>
		</Main>
	);
}

type TournamentContext = {
	tournament: Tournament;
	tournamentNew: SerializeFrom<typeof loader>["tournamentNew"];
	bracketExpanded: boolean;
	streamingParticipants: number[];
	setBracketExpanded: (expanded: boolean) => void;
	friendCode?: string;
};

export function useTournament() {
	return useOutletContext<TournamentContext>().tournament;
}

// xxx: rename
export function useTournamentNew() {
	return useOutletContext<TournamentContext>().tournamentNew;
}

export function useBracketExpanded() {
	const { bracketExpanded, setBracketExpanded } =
		useOutletContext<TournamentContext>();

	return { bracketExpanded, setBracketExpanded };
}

export function useStreamingParticipants() {
	return useOutletContext<TournamentContext>().streamingParticipants;
}

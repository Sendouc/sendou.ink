import type {
	LoaderFunctionArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/node";
import {
	Outlet,
	type ShouldRevalidateFunction,
	useLoaderData,
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
import { isAdmin } from "~/permissions";
import { databaseTimestampToDate } from "~/utils/dates";
import type { SendouRouteHandle } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { assertUnreachable } from "~/utils/types";
import {
	tournamentOrganizationPage,
	tournamentPage,
	userSubmittedImage,
} from "~/utils/urls";
import { streamsByTournamentId } from "../core/streams.server";
import {
	HACKY_resolvePicture,
	tournamentIdFromParams,
} from "../tournament-utils";

import "../tournament.css";
import "~/styles/maps.css";
import "~/styles/calendar-event.css";

export const shouldRevalidate: ShouldRevalidateFunction = (args) => {
	const navigatedToMatchPage =
		typeof args.nextParams.mid === "string" && args.formMethod !== "POST";

	if (navigatedToMatchPage) return false;

	return args.defaultShouldRevalidate;
};

export const meta: MetaFunction = (args) => {
	const data = args.data as SerializeFrom<typeof loader>;

	if (!data) return [];

	const title = makeTitle(data.tournament.ctx.name);

	return [
		{ title },
		{
			property: "og:title",
			content: title,
		},
		{
			property: "og:description",
			content: data.tournament.ctx.description,
		},
		{
			property: "og:type",
			content: "website",
		},
		{
			property: "og:image",
			content: data.tournament.ctx.logoSrc,
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
			data.tournament.ctx.organization?.avatarUrl
				? {
						imgPath: userSubmittedImage(
							data.tournament.ctx.organization.avatarUrl,
						),
						href: tournamentOrganizationPage({
							organizationSlug: data.tournament.ctx.organization.slug,
						}),
						type: "IMAGE" as const,
						text: "",
						rounded: true,
					}
				: null,
			{
				imgPath: data.tournament.ctx.logoUrl
					? userSubmittedImage(data.tournament.ctx.logoUrl)
					: HACKY_resolvePicture(data.tournament.ctx),
				href: tournamentPage(data.tournament.ctx.id),
				type: "IMAGE" as const,
				text: data.tournament.ctx.name,
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

	const streams =
		tournament.data.stage.length > 0 && !tournament.ctx.isFinalized
			? await streamsByTournamentId(tournament.ctx)
			: [];

	const tournamentStartedInTheLastMonth =
		databaseTimestampToDate(tournament.ctx.startTime) >
		new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	const isTournamentAdmin =
		tournament.ctx.author.id === user?.id ||
		tournament.ctx.staff.some(
			(s) => s.role === "ORGANIZER" && s.id === user?.id,
		) ||
		isAdmin(user) ||
		tournament.ctx.organization?.members.some(
			(m) => m.userId === user?.id && m.role === "ADMIN",
		);
	const isTournamentOrganizer =
		isTournamentAdmin ||
		tournament.ctx.staff.some(
			(s) => s.role === "ORGANIZER" && s.id === user?.id,
		) ||
		tournament.ctx.organization?.members.some(
			(m) => m.userId === user?.id && m.role === "ORGANIZER",
		);
	const showFriendCodes = tournamentStartedInTheLastMonth && isTournamentAdmin;

	return {
		tournament,
		streamingParticipants: streams.flatMap((s) => (s.userId ? [s.userId] : [])),
		streamsCount: streams.length,
		friendCodes: showFriendCodes
			? await TournamentRepository.friendCodesByTournamentId(tournamentId)
			: undefined,
		preparedMaps:
			isTournamentOrganizer && !tournament.ctx.isFinalized
				? await TournamentRepository.findPreparedMapsById(tournamentId)
				: undefined,
	};
};

const TournamentContext = React.createContext<Tournament>(null!);

export default function TournamentLayout() {
	const { t } = useTranslation(["tournament"]);
	const user = useUser();
	const data = useLoaderData<typeof loader>();
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

	const subsCount = () =>
		tournament.ctx.subCounts.reduce((acc, cur) => {
			if (cur.visibility === "ALL") return acc + cur.count;

			const userPlusTier = user?.plusTier ?? 4;

			switch (cur.visibility) {
				case "+1": {
					return userPlusTier === 1 ? acc + cur.count : acc;
				}
				case "+2": {
					return userPlusTier <= 2 ? acc + cur.count : acc;
				}
				case "+3": {
					return userPlusTier <= 3 ? acc + cur.count : acc;
				}
				default: {
					assertUnreachable(cur.visibility);
				}
			}
		}, 0);

	return (
		<Main bigger>
			<SubNav>
				<SubNavLink to="register" data-testid="register-tab" prefetch="intent">
					{tournament.hasStarted ? "Info" : t("tournament:tabs.register")}
				</SubNavLink>
				<SubNavLink to="brackets" data-testid="brackets-tab" prefetch="render">
					{t("tournament:tabs.brackets")}
				</SubNavLink>
				<SubNavLink to="teams" end={false} prefetch="render">
					{t("tournament:tabs.teams", { count: tournament.ctx.teams.length })}
				</SubNavLink>
				{!tournament.everyBracketOver && tournament.subsFeatureEnabled && (
					<SubNavLink to="subs" end={false}>
						{t("tournament:tabs.subs", { count: subsCount() })}
					</SubNavLink>
				)}
				{tournament.hasStarted && !tournament.everyBracketOver ? (
					<SubNavLink to="streams">
						{t("tournament:tabs.streams", {
							count: data.streamsCount,
						})}
					</SubNavLink>
				) : null}
				{tournament.hasStarted ? (
					<SubNavLink to="results" data-testid="results-tab">
						{t("tournament:tabs.results")}
					</SubNavLink>
				) : null}
				{tournament.isOrganizer(user) && !tournament.hasStarted && (
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
							bracketExpanded,
							setBracketExpanded,
							streamingParticipants: data.streamingParticipants,
							friendCodes: data.friendCodes,
							preparedMaps: data.preparedMaps,
						} satisfies TournamentContext
					}
				/>
			</TournamentContext.Provider>
		</Main>
	);
}

type TournamentContext = {
	tournament: Tournament;
	bracketExpanded: boolean;
	streamingParticipants: number[];
	setBracketExpanded: (expanded: boolean) => void;
	friendCode?: string;
	friendCodes?: SerializeFrom<typeof loader>["friendCodes"];
	preparedMaps: SerializeFrom<typeof loader>["preparedMaps"];
};

export function useTournament() {
	return useOutletContext<TournamentContext>().tournament;
}

export function useBracketExpanded() {
	const { bracketExpanded, setBracketExpanded } =
		useOutletContext<TournamentContext>();

	return { bracketExpanded, setBracketExpanded };
}

export function useStreamingParticipants() {
	return useOutletContext<TournamentContext>().streamingParticipants;
}

export function useTournamentFriendCodes() {
	return useOutletContext<TournamentContext>().friendCodes;
}

export function useTournamentPreparedMaps() {
	return useOutletContext<TournamentContext>().preparedMaps;
}

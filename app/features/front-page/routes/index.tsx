import type { SerializeFrom } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { Divider } from "~/components/Divider";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { Placement } from "~/components/Placement";
import { BSKYLikeIcon } from "~/components/icons/BSKYLike";
import { BSKYReplyIcon } from "~/components/icons/BSKYReply";
import { BSKYRepostIcon } from "~/components/icons/BSKYRepost";
import { ExternalIcon } from "~/components/icons/External";
import { GlobeIcon } from "~/components/icons/Globe";
import { LogInIcon } from "~/components/icons/LogIn";
import { LogOutIcon } from "~/components/icons/LogOut";
import { LanguageChanger } from "~/components/layout/LanguageChanger";
import { LogInButtonContainer } from "~/components/layout/LogInButtonContainer";
import { SelectedThemeIcon } from "~/components/layout/SelectedThemeIcon";
import { ThemeChanger } from "~/components/layout/ThemeChanger";
import navItems from "~/components/layout/nav-items.json";
import { useUser } from "~/features/auth/core/user";
import type * as Changelog from "~/features/front-page/core/Changelog.server";
import { currentOrPreviousSeason } from "~/features/mmr/season";
import { useTheme } from "~/features/theme/core/provider";
import {
	HACKY_resolvePicture,
	HACKY_resolveThemeColors,
} from "~/features/tournament/tournament-utils";
import { useIsMounted } from "~/hooks/useIsMounted";
import { languages } from "~/modules/i18n/config";
import { databaseTimestampToDate } from "~/utils/dates";
import {
	CALENDAR_PAGE,
	CALENDAR_TOURNAMENTS_PAGE,
	FRONT_BOY_BG_PATH,
	FRONT_BOY_PATH,
	FRONT_GIRL_BG_PATH,
	FRONT_GIRL_PATH,
	LOG_OUT_URL,
	SENDOUQ_PAGE,
	leaderboardsPage,
	navIconUrl,
	teamPage,
	tournamentPage,
	userPage,
	userSubmittedImage,
} from "~/utils/urls";

import { loader } from "../loaders/index.server";
export { loader };

import "~/styles/front.css";
import { NewTabs } from "~/components/NewTabs";
import { ArrowRightIcon } from "~/components/icons/ArrowRight";
import { UsersIcon } from "~/components/icons/Users";

// xxx: nav items to left on desktop

export default function FrontPage() {
	return (
		<Main className="front-page__container">
			<SeasonBanner />
			<TournamentCards />
			<ResultHighlights />
			<ChangelogList />
		</Main>
	);
}

// xxx: if over, advertise SQ season finale event?
function SeasonBanner() {
	const { i18n } = useTranslation();
	const season = currentOrPreviousSeason(new Date())!;

	return (
		<div className="stack xs">
			<Link to={SENDOUQ_PAGE} className="front__season-banner">
				<div className="front__season-banner__header">Season {season.nth}</div>
				<div className="front__season-banner__dates">
					{season.starts.toLocaleDateString(i18n.language, {
						month: "long",
						day: "numeric",
					})}{" "}
					-{" "}
					{season.ends.toLocaleDateString(i18n.language, {
						month: "long",
						day: "numeric",
					})}
				</div>
				<img
					alt=""
					className="front__season-banner__img"
					src="http://localhost:5173/static-assets/img/robot.png"
				/>
			</Link>
			<Link to={SENDOUQ_PAGE} className="front__season-banner__link">
				<div className="stack horizontal xs items-center">
					<Image path={navIconUrl("sendouq")} width={24} alt="" />
					Particate now! <ArrowRightIcon />
				</div>
			</Link>
		</div>
	);
}

function TournamentCards() {
	const data = useLoaderData<typeof loader>();

	return (
		<div>
			<NewTabs
				tabs={[
					{
						label: "Signed up for",
					},
					{
						label: "Organizer for",
					},
					{
						label: "Discover",
					},
				]}
				content={[
					{
						key: "your",
						element: (
							<div className="front__tournament-cards">
								<div className="front__tournament-cards__scroller">
									{data.tournaments.map((tournament) => (
										<TournamentCard
											key={tournament.id}
											tournament={tournament}
										/>
									))}
								</div>
								<AllTournamentsLinkCard />
							</div>
						),
					},
				]}
			/>
		</div>
	);
}

// xxx: only first tab..?
function AllTournamentsLinkCard() {
	return (
		<Link
			to={CALENDAR_TOURNAMENTS_PAGE}
			className="front__tournament-cards__view-all-card"
		>
			<Image path={navIconUrl("medal")} size={36} alt="" />
			View all tournaments
		</Link>
	);
}

function TournamentCard({
	tournament,
}: { tournament: SerializeFrom<typeof loader>["tournaments"][number] }) {
	const isMounted = useIsMounted();
	const { i18n } = useTranslation(["common"]);

	const time = () => {
		if (!isMounted) return "Placeholder";

		return databaseTimestampToDate(tournament.startTime).toLocaleString(
			i18n.language,
			{
				month: "numeric",
				day: "numeric",
				hour: "numeric",
			},
		);
	};

	return (
		<div className="front__tournament-card__container">
			<Link
				to={tournamentPage(tournament.id)}
				className="front__tournament-card"
			>
				<div className="stack horizontal justify-between">
					<div className="front__tournament-card__img-container">
						<img
							src={
								tournament.logoUrl
									? userSubmittedImage(tournament.logoUrl)
									: HACKY_resolvePicture(tournament)
							}
							width={32}
							height={32}
							className="front__tournament-card__tournament-avatar-img"
							alt=""
						/>
					</div>
					<div className="front__tournament-card__org">
						<Avatar size="xxxs" /> Dapple Productions
					</div>
				</div>
				<div className="front__tournament-card__name">
					{tournament.name}{" "}
					<time
						className={clsx("front__tournament-card__time", {
							invisible: !isMounted,
						})}
						dateTime={databaseTimestampToDate(
							tournament.startTime,
						).toISOString()}
					>
						{time()}
					</time>
				</div>
			</Link>
			<div className="stack horizontal xxs justify-end">
				<div className="front__tournament-card__team-count">
					<UsersIcon /> 48
				</div>
				<div className="front__tournament-card__ranked">Ranked</div>
			</div>
		</div>
	);
}

// xxx: on mobile tournament results on a different line?
function ResultHighlights() {
	const data = useLoaderData<typeof loader>();

	const season = currentOrPreviousSeason(new Date())!;

	console.log({ data });

	return (
		<div className="front__result-highlights">
			<div className="stack sm text-center">
				<h2 className="front__result-highlights__title">Top players</h2>
				<Leaderboard
					entries={data.leaderboards.user.map((entry) => ({
						avatarUrl: `https://cdn.discordapp.com/avatars/${entry.discordId}/${
							entry.discordAvatar
						}.webp?size=80`,
						name: entry.username,
						power: entry.power,
						url: userPage(entry),
					}))}
					fullLeaderboardUrl={leaderboardsPage({
						season: season.nth,
						type: "USER",
					})}
				/>
			</div>
			<div className="stack sm text-center">
				<h2 className="front__result-highlights__title">Top teams</h2>
				<Leaderboard
					entries={data.leaderboards.team.map((entry) => ({
						avatarUrl: userSubmittedImage(entry.team!.avatarUrl!),
						name: entry.team?.name,
						power: entry.power,
						url: teamPage(entry.team!.customUrl!),
					}))}
					fullLeaderboardUrl={leaderboardsPage({
						season: season.nth,
						type: "TEAM",
					})}
				/>
			</div>
			<h2 className="front__result-highlights__title">Recent results</h2>
		</div>
	);
}

// xxx: TODO: calc in backend
// xxx: countries?
interface LeaderboardEntry {
	name: string;
	url: string;
	avatarUrl: string;
	power: number;
}

function Leaderboard({
	entries,
	fullLeaderboardUrl,
}: { entries: LeaderboardEntry[]; fullLeaderboardUrl: string }) {
	return (
		<div className="stack xs items-center">
			<div className="front__leaderboard">
				{entries.map((entry, index) => (
					<Link
						to={entry.url}
						key={entry.url}
						className="stack sm horizontal items-center text-main-forced"
					>
						<div>{index + 1}</div>
						<Avatar url={entry.avatarUrl} size="xs" />
						<div className="stack items-start">
							<div className="font-bold text-sm">{entry.name}</div>
							<div className="text-xs font-semi-bold text-lighter">
								{entry.power}
							</div>
						</div>
					</Link>
				))}
			</div>
			<Link to={fullLeaderboardUrl} className="front__leaderboard__view-all">
				<Image path={navIconUrl("leaderboards")} size={16} alt="" />
				View full leaderboard
			</Link>
		</div>
	);
}

// export default function FrontPage() {
// 	const data = useLoaderData<typeof loader>();
// 	const { userTheme } = useTheme();
// 	const [filters, setFilters] = React.useState<[string, string]>(
// 		navItems[0]?.filters as [string, string],
// 	);
// 	const { t, i18n } = useTranslation(["common"]);
// 	const user = useUser();

// 	const selectedLanguage = languages.find(
// 		(lang) => i18n.language === lang.code,
// 	);

// 	return (
// 		<Main className="stack lg">
// 			<div className="stack horizontal sm">
// 				{data.tournaments.map((tournament) => (
// 					<TournamentCard key={tournament.id} tournament={tournament} />
// 				))}
// 			</div>
// 			<div className="front__nav-items-container">
// 				<div className="front__nav-item round">
// 					<LanguageChanger plain>
// 						<div className="front__nav-image-container round">
// 							<GlobeIcon size={28} alt={t("common:header.language")} />
// 						</div>
// 					</LanguageChanger>
// 					{selectedLanguage?.name ?? ""}
// 				</div>

// 				<div className="front__nav-item round">
// 					<ThemeChanger plain>
// 						<div className="front__nav-image-container round">
// 							<SelectedThemeIcon size={28} />
// 						</div>
// 					</ThemeChanger>
// 					{t(`common:theme.${userTheme ?? "auto"}`)}
// 				</div>
// 				<LogInButton />
// 				{navItems.map((item) => (
// 					<Link
// 						to={`/${item.url}`}
// 						className="front__nav-item"
// 						key={item.name}
// 						prefetch={item.prefetch ? "render" : undefined}
// 						onMouseEnter={() => setFilters(item.filters as [string, string])}
// 					>
// 						<div className="front__nav-image-container">
// 							<Image
// 								path={navIconUrl(item.name)}
// 								height={48}
// 								width={48}
// 								alt=""
// 							/>
// 						</div>
// 						<div>{t(`common:pages.${item.name}` as any)}</div>
// 					</Link>
// 				))}
// 			</div>
// 			{user ? (
// 				<div className="front__log-out-container">
// 					<form method="post" action={LOG_OUT_URL}>
// 						<Button
// 							size="tiny"
// 							variant="outlined"
// 							icon={<LogOutIcon />}
// 							type="submit"
// 							className="w-full"
// 						>
// 							{t("common:header.logout")}
// 						</Button>
// 					</form>
// 				</div>
// 			) : null}
// 			<ChangelogList />
// 			<Drawings filters={filters} />
// 		</Main>
// 	);
// }

// function TournamentCard({
// 	tournament,
// }: {
// 	tournament: SerializeFrom<typeof loader>["tournaments"][number];
// }) {
// 	const { t } = useTranslation(["common"]);
// 	const isMounted = useIsMounted();
// 	const { i18n } = useTranslation();
// 	const theme =
// 		tournament.avatarMetadata ?? HACKY_resolveThemeColors(tournament);

// 	const happeningNow =
// 		tournament.firstPlacers.length === 0 &&
// 		databaseTimestampToDate(tournament.startTime) < new Date();

// 	const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: "auto" });

// 	const time = () => {
// 		if (!isMounted) return "Placeholder";
// 		if (happeningNow) return t("common:showcase.liveNow");

// 		const date = databaseTimestampToDate(tournament.startTime);
// 		const dayDifference = Math.floor(
// 			(date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
// 		);

// 		if (tournament.firstPlacers.length > 0)
// 			return rtf.format(dayDifference, "day");

// 		return databaseTimestampToDate(tournament.startTime).toLocaleString(
// 			i18n.language,
// 			{
// 				month: "numeric",
// 				day: "numeric",
// 				hour: "numeric",
// 			},
// 		);
// 	};

// 	return (
// 		<Link
// 			to={tournamentPage(tournament.id)}
// 			className="front__tournament-card"
// 			style={{
// 				"--card-bg": theme.backgroundColor,
// 				"--card-text": theme.textColor,
// 			}}
// 		>
// 			<div className="stack horizontal justify-between items-center">
// 				<img
// 					src={
// 						tournament.logoUrl
// 							? userSubmittedImage(tournament.logoUrl)
// 							: HACKY_resolvePicture(tournament)
// 					}
// 					width={24}
// 					height={24}
// 					className="rounded-full"
// 					alt=""
// 				/>
// 				<div
// 					className={clsx("front__tournament-card__time", {
// 						invisible: !isMounted,
// 					})}
// 				>
// 					{time()}
// 				</div>
// 			</div>
// 			<div className="front__tournament-card__name">{tournament.name}</div>
// 			{tournament.firstPlacers.length > 0 ? (
// 				<>
// 					<div />
// 					<div className="mx-auto stack horizontal sm items-center text-xs">
// 						<Placement placement={1} size={16} />
// 						{tournament.firstPlacers[0].teamName}
// 					</div>
// 					<ul className="front__tournament-card__first-placers">
// 						{tournament.firstPlacers.map((p) => (
// 							<li key={p.id}>{p.username}</li>
// 						))}
// 					</ul>
// 				</>
// 			) : (
// 				<div className="front__tournament-card__register">
// 					{happeningNow
// 						? t("common:showcase.bracket")
// 						: t("common:showcase.register")}
// 				</div>
// 			)}
// 		</Link>
// 	);
// }

// function LogInButton() {
// 	const { t } = useTranslation(["common"]);
// 	const user = useUser();

// 	if (user) {
// 		return (
// 			<Link to={userPage(user)} className="front__nav-item round">
// 				<Avatar
// 					user={user}
// 					alt={t("common:header.loggedInAs", {
// 						userName: `${user.username}`,
// 					})}
// 					className="front__avatar"
// 					size="sm"
// 				/>
// 				{t("common:pages.myPage")}
// 			</Link>
// 		);
// 	}

// 	return (
// 		<div className="front__nav-item round">
// 			<LogInButtonContainer>
// 				<button className="front__log-in-button" type="submit">
// 					<LogInIcon size={28} />
// 				</button>
// 			</LogInButtonContainer>
// 			{t("common:header.login")}
// 		</div>
// 	);
// }

function ChangelogList() {
	const data = useLoaderData<typeof loader>();

	if (data.changelog.length === 0) return null;

	return (
		<div className="stack md">
			<Divider smallText className="text-uppercase text-xs font-bold">
				Updates
			</Divider>
			{data.changelog.map((item) => (
				<React.Fragment key={item.id}>
					<ChangelogItem item={item} />
					<br />
				</React.Fragment>
			))}
			<a
				href="https://bsky.app/hashtag/sendouink?author=sendou.ink"
				target="_blank"
				rel="noopener noreferrer"
				className="stack horizontal sm mx-auto text-xs font-bold"
			>
				View past updates <ExternalIcon className="front__external-link-icon" />
			</a>
		</div>
	);
}

const ADMIN_PFP_URL =
	"https://cdn.discordapp.com/avatars/79237403620945920/6fc41a44b069a0d2152ac06d1e496c6c.webp?size=80";

function ChangelogItem({
	item,
}: {
	item: Changelog.ChangelogItem;
}) {
	return (
		<div className="stack sm horizontal">
			<Avatar size="sm" url={ADMIN_PFP_URL} />
			<div className="whitespace-pre-wrap">
				<div className="font-bold">
					Sendou{" "}
					<span className="text-xs text-lighter">{item.createdAtRelative}</span>
				</div>
				{item.text}
				{item.images.length > 0 ? (
					<div className="mt-4 stack horizontal sm flex-wrap">
						{item.images.map((image) => (
							<img
								key={image.thumb}
								src={image.thumb}
								alt=""
								className="front__change-log__img"
							/>
						))}
					</div>
				) : null}
				<div className="mt-4 stack xxl horizontal">
					<BSKYIconLink count={item.stats.replies} postUrl={item.postUrl}>
						<BSKYReplyIcon />
					</BSKYIconLink>
					<BSKYIconLink count={item.stats.reposts} postUrl={item.postUrl}>
						<BSKYRepostIcon />
					</BSKYIconLink>
					<BSKYIconLink count={item.stats.likes} postUrl={item.postUrl}>
						<BSKYLikeIcon />
					</BSKYIconLink>
				</div>
			</div>
		</div>
	);
}

function BSKYIconLink({
	children,
	count,
	postUrl,
}: { children: React.ReactNode; count: number; postUrl: string }) {
	return (
		<a
			href={postUrl}
			target="_blank"
			rel="noopener noreferrer"
			className="front__change-log__icon-button"
		>
			{children}
			<span
				className={clsx({
					invisible: count === 0,
				})}
			>
				{count}
			</span>
		</a>
	);
}

// function Drawings({
// 	filters,
// }: {
// 	filters: [boyFilter: string, girlFilter: string];
// }) {
// 	return (
// 		<div className="front__drawings">
// 			<Image
// 				path={FRONT_BOY_PATH}
// 				className="front__drawing-img"
// 				containerClassName="front__drawings__boy"
// 				alt=""
// 			/>
// 			<Image
// 				path={FRONT_BOY_BG_PATH}
// 				className="front__drawing-img"
// 				containerClassName="front__drawings__boy bg"
// 				style={{ filter: filters[0] }}
// 				alt=""
// 			/>
// 			<Image
// 				path={FRONT_GIRL_PATH}
// 				className="front__drawing-img"
// 				containerClassName="front__drawings__girl"
// 				alt=""
// 			/>
// 			<Image
// 				path={FRONT_GIRL_BG_PATH}
// 				className="front__drawing-img"
// 				containerClassName="front__drawings__girl bg"
// 				style={{ filter: filters[1] }}
// 				alt=""
// 			/>
// 		</div>
// 	);
// }

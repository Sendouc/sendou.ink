import type { SerializeFrom } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
// xxx: to server
import { formatDistance } from "date-fns";
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
import { useTheme } from "~/features/theme/core/provider";
import {
	HACKY_resolvePicture,
	HACKY_resolveThemeColors,
} from "~/features/tournament/tournament-utils";
import { useIsMounted } from "~/hooks/useIsMounted";
import { languages } from "~/modules/i18n/config";
import { databaseTimestampToDate } from "~/utils/dates";
import {
	FRONT_BOY_BG_PATH,
	FRONT_BOY_PATH,
	FRONT_GIRL_BG_PATH,
	FRONT_GIRL_PATH,
	LOG_OUT_URL,
	navIconUrl,
	tournamentPage,
	userPage,
	userSubmittedImage,
} from "~/utils/urls";

import { loader } from "../loaders/index.server";
export { loader };

import "~/styles/front.css";

export default function FrontPage() {
	const data = useLoaderData<typeof loader>();
	const { userTheme } = useTheme();
	const [filters, setFilters] = React.useState<[string, string]>(
		navItems[0]?.filters as [string, string],
	);
	const { t, i18n } = useTranslation(["common"]);
	const user = useUser();

	const selectedLanguage = languages.find(
		(lang) => i18n.language === lang.code,
	);

	return (
		<Main className="stack lg">
			<div className="stack horizontal sm">
				{data.tournaments.map((tournament) => (
					<TournamentCard key={tournament.id} tournament={tournament} />
				))}
			</div>
			<div className="front__nav-items-container">
				<div className="front__nav-item round">
					<LanguageChanger plain>
						<div className="front__nav-image-container round">
							<GlobeIcon size={28} alt={t("common:header.language")} />
						</div>
					</LanguageChanger>
					{selectedLanguage?.name ?? ""}
				</div>

				<div className="front__nav-item round">
					<ThemeChanger plain>
						<div className="front__nav-image-container round">
							<SelectedThemeIcon size={28} />
						</div>
					</ThemeChanger>
					{t(`common:theme.${userTheme ?? "auto"}`)}
				</div>
				<LogInButton />
				{navItems.map((item) => (
					<Link
						to={`/${item.url}`}
						className="front__nav-item"
						key={item.name}
						prefetch={item.prefetch ? "render" : undefined}
						onMouseEnter={() => setFilters(item.filters as [string, string])}
					>
						<div className="front__nav-image-container">
							<Image
								path={navIconUrl(item.name)}
								height={48}
								width={48}
								alt=""
							/>
						</div>
						<div>{t(`common:pages.${item.name}` as any)}</div>
					</Link>
				))}
			</div>
			{user ? (
				<div className="front__log-out-container">
					<form method="post" action={LOG_OUT_URL}>
						<Button
							size="tiny"
							variant="outlined"
							icon={<LogOutIcon />}
							type="submit"
							className="w-full"
						>
							{t("common:header.logout")}
						</Button>
					</form>
				</div>
			) : null}
			<ChangelogList />
			<Drawings filters={filters} />
		</Main>
	);
}

function TournamentCard({
	tournament,
}: {
	tournament: SerializeFrom<typeof loader>["tournaments"][number];
}) {
	const { t } = useTranslation(["common"]);
	const isMounted = useIsMounted();
	const { i18n } = useTranslation();
	const theme =
		tournament.avatarMetadata ?? HACKY_resolveThemeColors(tournament);

	const happeningNow =
		tournament.firstPlacers.length === 0 &&
		databaseTimestampToDate(tournament.startTime) < new Date();

	const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: "auto" });

	const time = () => {
		if (!isMounted) return "Placeholder";
		if (happeningNow) return t("common:showcase.liveNow");

		const date = databaseTimestampToDate(tournament.startTime);
		const dayDifference = Math.floor(
			(date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
		);

		if (tournament.firstPlacers.length > 0)
			return rtf.format(dayDifference, "day");

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
		<Link
			to={tournamentPage(tournament.id)}
			className="front__tournament-card"
			style={{
				"--card-bg": theme.backgroundColor,
				"--card-text": theme.textColor,
			}}
		>
			<div className="stack horizontal justify-between items-center">
				<img
					src={
						tournament.logoUrl
							? userSubmittedImage(tournament.logoUrl)
							: HACKY_resolvePicture(tournament)
					}
					width={24}
					height={24}
					className="rounded-full"
					alt=""
				/>
				<div
					className={clsx("front__tournament-card__time", {
						invisible: !isMounted,
					})}
				>
					{time()}
				</div>
			</div>
			<div className="front__tournament-card__name">{tournament.name}</div>
			{tournament.firstPlacers.length > 0 ? (
				<>
					<div />
					<div className="mx-auto stack horizontal sm items-center text-xs">
						<Placement placement={1} size={16} />
						{tournament.firstPlacers[0].teamName}
					</div>
					<ul className="front__tournament-card__first-placers">
						{tournament.firstPlacers.map((p) => (
							<li key={p.id}>{p.username}</li>
						))}
					</ul>
				</>
			) : (
				<div className="front__tournament-card__register">
					{happeningNow
						? t("common:showcase.bracket")
						: t("common:showcase.register")}
				</div>
			)}
		</Link>
	);
}

function LogInButton() {
	const { t } = useTranslation(["common"]);
	const user = useUser();

	if (user) {
		return (
			<Link to={userPage(user)} className="front__nav-item round">
				<Avatar
					user={user}
					alt={t("common:header.loggedInAs", {
						userName: `${user.username}`,
					})}
					className="front__avatar"
					size="sm"
				/>
				{t("common:pages.myPage")}
			</Link>
		);
	}

	return (
		<div className="front__nav-item round">
			<LogInButtonContainer>
				<button className="front__log-in-button" type="submit">
					<LogInIcon size={28} />
				</button>
			</LogInButtonContainer>
			{t("common:header.login")}
		</div>
	);
}

function ChangelogList() {
	const data = useLoaderData<typeof loader>();

	if (data.changelog.length === 0) return null;

	return (
		<div className="stack md">
			<Divider smallText className="text-uppercase text-xs font-bold">
				Updates
			</Divider>
			{data.changelog.map((item) => (
				<React.Fragment key={item.createdAt}>
					<ChangelogItem item={item} />
					<br />
				</React.Fragment>
			))}
			<a
				href="https://bsky.app/hashtag/sendouink?author=sendou.ink"
				target="_blank"
				rel="noopener noreferrer"
			>
				View past updates
			</a>
		</div>
	);
}

const ADMIN_PFP_URL =
	"https://cdn.discordapp.com/avatars/79237403620945920/6fc41a44b069a0d2152ac06d1e496c6c.webp?size=80";

// xxx: style bottom button
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
					<span className="text-xs text-lighter">
						{formatDistance(new Date(item.createdAt), new Date(), {
							addSuffix: true,
						})}
					</span>
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

function Drawings({
	filters,
}: {
	filters: [boyFilter: string, girlFilter: string];
}) {
	return (
		<div className="front__drawings">
			<Image
				path={FRONT_BOY_PATH}
				className="front__drawing-img"
				containerClassName="front__drawings__boy"
				alt=""
			/>
			<Image
				path={FRONT_BOY_BG_PATH}
				className="front__drawing-img"
				containerClassName="front__drawings__boy bg"
				style={{ filter: filters[0] }}
				alt=""
			/>
			<Image
				path={FRONT_GIRL_PATH}
				className="front__drawing-img"
				containerClassName="front__drawings__girl"
				alt=""
			/>
			<Image
				path={FRONT_GIRL_BG_PATH}
				className="front__drawing-img"
				containerClassName="front__drawings__girl bg"
				style={{ filter: filters[1] }}
				alt=""
			/>
		</div>
	);
}

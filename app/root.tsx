import cachified from "@epic-web/cachified";
import type {
	LoaderFunctionArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	type ShouldRevalidateFunction,
	useLoaderData,
	useMatches,
	useNavigation,
} from "@remix-run/react";
import generalI18next from "i18next";
import NProgress from "nprogress";
import * as React from "react";
import { type CustomTypeOptions, useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import { cache, ttl } from "~/utils/cache.server";
import type { SendouRouteHandle } from "~/utils/remix";
import { Catcher } from "./components/Catcher";
import { Layout } from "./components/layout";
import {
	CUSTOMIZED_CSS_VARS_NAME,
	ONE_HOUR_IN_MS,
	TEN_MINUTES_IN_MS,
} from "./constants";
import { getUser } from "./features/auth/core/user.server";
import { userIsBanned } from "./features/ban/core/banned.server";
import {
	Theme,
	ThemeHead,
	ThemeProvider,
	isTheme,
	useTheme,
} from "./features/theme/core/provider";
import { getThemeSession } from "./features/theme/core/session.server";
import { useIsMounted } from "./hooks/useIsMounted";
import { DEFAULT_LANGUAGE } from "./modules/i18n/config";
import i18next, { i18nCookie } from "./modules/i18n/i18next.server";
import { COMMON_PREVIEW_IMAGE, SUSPENDED_PAGE } from "./utils/urls";

import "nprogress/nprogress.css";
import "~/styles/common.css";
import "~/styles/flags.css";
import "~/styles/layout.css";
import "~/styles/reset.css";
import "~/styles/utils.css";
import "~/styles/vars.css";

export const shouldRevalidate: ShouldRevalidateFunction = ({ nextUrl }) => {
	// // reload on language change so the selected language gets set into the cookie
	const lang = nextUrl.searchParams.get("lng");

	return Boolean(lang);
};

export const meta: MetaFunction = () => {
	return [
		{ title: "sendou.ink" },
		{
			name: "description",
			content:
				"Competitive Splatoon Hub featuring gear planner, event calendar, builds by top players, and more!",
		},
		{
			property: "og:image",
			content: COMMON_PREVIEW_IMAGE,
		},
	];
};

export type RootLoaderData = SerializeFrom<typeof loader>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await getUser(request, false);
	const locale = await i18next.getLocale(request);
	const themeSession = await getThemeSession(request);

	// avoid redirection loop
	if (
		user &&
		userIsBanned(user?.id) &&
		new URL(request.url).pathname !== SUSPENDED_PAGE
	) {
		return redirect(SUSPENDED_PAGE);
	}

	return json(
		{
			locale,
			theme: themeSession.getTheme(),
			tournaments: await cachified({
				key: "tournament-showcase",
				cache,
				ttl: ttl(TEN_MINUTES_IN_MS),
				staleWhileRevalidate: ttl(ONE_HOUR_IN_MS),
				async getFreshValue() {
					return TournamentRepository.forShowcase();
				},
			}),
			baseUrl: process.env.BASE_URL!,
			skalopUrl: process.env.SKALOP_WS_URL!,
			publisherId: process.env.PLAYWIRE_PUBLISHER_ID,
			websiteId: process.env.PLAYWIRE_WEBSITE_ID,
			loginDisabled: process.env.LOGIN_DISABLED === "true",
			user: user
				? {
						username: user.username,
						discordAvatar: user.discordAvatar,
						discordId: user.discordId,
						id: user.id,
						plusTier: user.plusTier,
						customUrl: user.customUrl,
						patronTier: user.patronTier,
						isArtist: user.isArtist,
						isVideoAdder: user.isVideoAdder,
						inGameName: user.inGameName,
						friendCode: user.friendCode,
						languages: user.languages ? user.languages.split(",") : [],
					}
				: undefined,
		},
		{
			headers: { "Set-Cookie": await i18nCookie.serialize(locale) },
		},
	);
};

export const handle: SendouRouteHandle = {
	i18n: ["common", "game-misc", "weapons"],
};

function Document({
	children,
	data,
	isErrored = false,
}: {
	children: React.ReactNode;
	data?: RootLoaderData;
	isErrored?: boolean;
}) {
	const { htmlThemeClass } = useTheme();
	const { i18n } = useTranslation();
	const locale = data?.locale ?? DEFAULT_LANGUAGE;

	useChangeLanguage(locale);
	usePreloadTranslation();
	useLoadingIndicator();
	const customizedCSSVars = useCustomizedCSSVars();

	return (
		<html lang={locale} dir={i18n.dir()} className={htmlThemeClass}>
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="initial-scale=1, viewport-fit=cover, user-scalable=no"
				/>
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="black-translucent"
				/>
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="theme-color" content="#010115" />
				<Meta />
				<Links />
				<ThemeHead />
				<link rel="manifest" href="/app.webmanifest" />
				<PWALinks />
				<Fonts />
			</head>
			<body style={customizedCSSVars}>
				{process.env.NODE_ENV === "development" && <HydrationTestIndicator />}
				<React.StrictMode>
					<MyRamp data={data} />
					<Layout data={data} isErrored={isErrored}>
						{children}
					</Layout>
				</React.StrictMode>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

function useLoadingIndicator() {
	const transition = useNavigation();

	React.useEffect(() => {
		if (transition.state === "loading") NProgress.start();
		if (transition.state === "idle") NProgress.done();
	}, [transition.state]);
}

// TODO: this should be an array if we can figure out how to make Typescript
// enforce that it has every member of keyof CustomTypeOptions["resources"] without duplicating the type manually
export const namespaceJsonsToPreloadObj: Record<
	keyof CustomTypeOptions["resources"],
	boolean
> = {
	common: true,
	analyzer: true,
	badges: true,
	builds: true,
	calendar: true,
	contributions: true,
	faq: true,
	"game-misc": true,
	gear: true,
	user: true,
	weapons: true,
	tournament: true,
	team: true,
	vods: true,
	art: true,
	q: true,
	lfg: true,
	org: true,
};
const namespaceJsonsToPreload = Object.keys(namespaceJsonsToPreloadObj);

function usePreloadTranslation() {
	React.useEffect(() => {
		void generalI18next.loadNamespaces(namespaceJsonsToPreload);
	}, []);
}

function useCustomizedCSSVars() {
	const matches = useMatches();

	for (const match of matches) {
		if ((match.data as any)?.[CUSTOMIZED_CSS_VARS_NAME]) {
			// cheating TypeScript here but no real way to keep up
			// even an illusion of type safety here
			return Object.fromEntries(
				Object.entries(
					(match.data as any)[CUSTOMIZED_CSS_VARS_NAME] as Record<
						string,
						string
					>,
				).map(([key, value]) => [`--${key}`, value]),
			) as React.CSSProperties;
		}
	}

	return;
}

export default function App() {
	// prop drilling data instead of using useLoaderData in the child components directly because
	// useLoaderData can't be used in CatchBoundary and layout is rendered in it as well
	//
	// Update 14.10.23: not sure if this still applies as the CatchBoundary is gone
	const data = useLoaderData<RootLoaderData>();

	return (
		<ThemeProvider
			specifiedTheme={isTheme(data.theme) ? data.theme : null}
			themeSource="user-preference"
		>
			<Document data={data}>
				<Outlet />
			</Document>
		</ThemeProvider>
	);
}

export const ErrorBoundary = () => {
	return (
		<ThemeProvider themeSource="static" specifiedTheme={Theme.DARK}>
			<Document isErrored>
				<Catcher />
			</Document>
		</ThemeProvider>
	);
};

function HydrationTestIndicator() {
	const isMounted = useIsMounted();

	if (!isMounted) return null;

	return <div style={{ display: "none" }} data-testid="hydrated" />;
}

function Fonts() {
	return (
		<>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
			<link
				href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap"
				rel="stylesheet"
			/>
		</>
	);
}

function PWALinks() {
	return (
		<>
			<link rel="apple-touch-icon" href="/static-assets/img/app-icon.png" />
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/iPhone_14_Pro_Max_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/iPhone_14_Pro_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/iPhone_11__iPhone_XR_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/12.9__iPad_Pro_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/11__iPad_Pro__10.5__iPad_Pro_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/10.9__iPad_Air_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/10.5__iPad_Air_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/10.2__iPad_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
				href="/static-assets/img/splash-screens/8.3__iPad_Mini_landscape.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/iPhone_14_Pro_Max_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/iPhone_14_Pro_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/iPhone_11__iPhone_XR_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/12.9__iPad_Pro_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/11__iPad_Pro__10.5__iPad_Pro_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/10.9__iPad_Air_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/10.5__iPad_Air_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/10.2__iPad_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png"
			/>
			<link
				rel="apple-touch-startup-image"
				media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
				href="/static-assets/img/splash-screens/8.3__iPad_Mini_portrait.png"
			/>
		</>
	);
}

const Ramp = React.lazy(() => import("./components/ramp/Ramp"));
function MyRamp({ data }: { data: RootLoaderData | undefined }) {
	if (
		!data ||
		!data.publisherId ||
		!data.websiteId ||
		data.user?.patronTier ||
		typeof window === "undefined"
	) {
		return null;
	}

	return <Ramp publisherId={data.publisherId} id={data.websiteId} />;
}

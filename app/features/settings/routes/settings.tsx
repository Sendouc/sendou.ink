import { useNavigate, useSearchParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { Theme, useTheme } from "~/features/theme/core/provider";
import { languages } from "~/modules/i18n/config";
import type { SendouRouteHandle } from "~/utils/remix";
import { SETTINGS_PAGE, navIconUrl } from "~/utils/urls";

export const handle: SendouRouteHandle = {
	breadcrumb: () => ({
		imgPath: navIconUrl("settings"),
		href: SETTINGS_PAGE,
		type: "IMAGE",
	}),
};

export default function SettingsPage() {
	return (
		<Main halfWidth>
			<div className="stack md">
				<h2 className="text-lg">Settings</h2>
				<LanguageSelector />
				<ThemeSelector />
			</div>
		</Main>
	);
}

function LanguageSelector() {
	const { i18n } = useTranslation();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const handleLanguageChange = (
		event: React.ChangeEvent<HTMLSelectElement>,
	) => {
		const newLang = event.target.value;
		navigate(`?${addUniqueParam(searchParams, "lng", newLang).toString()}`);
	};

	return (
		<div>
			<Label htmlFor="lang">Language</Label>
			<select
				id="lang"
				defaultValue={i18n.language}
				onChange={handleLanguageChange}
			>
				{languages.map((lang) => (
					<option key={lang.code} value={lang.code}>
						{lang.name}
					</option>
				))}
			</select>
		</div>
	);
}

function addUniqueParam(
	oldParams: URLSearchParams,
	name: string,
	value: string,
): URLSearchParams {
	const paramsCopy = new URLSearchParams(oldParams);
	paramsCopy.delete(name);
	paramsCopy.append(name, value);
	return paramsCopy;
}

function ThemeSelector() {
	const { t } = useTranslation();
	const { userTheme, setUserTheme } = useTheme();

	return (
		<div>
			<Label htmlFor="theme">Theme</Label>
			<select
				id="theme"
				defaultValue={userTheme ?? "auto"}
				onChange={(e) => setUserTheme(e.target.value as Theme)}
			>
				{(["auto", Theme.DARK, Theme.LIGHT] as const).map((theme) => {
					return (
						<option key={theme} value={theme}>
							{t(`theme.${theme}`)}
						</option>
					);
				})}
			</select>
		</div>
	);
}

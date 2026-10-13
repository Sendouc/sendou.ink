import { useTranslation } from "react-i18next";
import { Link, useMatches } from "react-router";
import { useUser } from "~/features/auth/core/user";
import { SelectFormField } from "~/form/fields/SelectFormField";
import { SendouForm } from "~/form/SendouForm";
import {
	type GameLanguageCode,
	gameLanguages,
	type LanguageCode,
	languages,
} from "~/modules/i18n/config";
import { languageSearchParams } from "~/modules/i18n/i18n-search-params";
import { useSearchParam } from "~/modules/search-params/hooks";
import type { RootLoaderData } from "~/root";
import { TRANSLATE_PAGE } from "~/utils/urls";
import { clockFormatSchema } from "../settings-schemas";

// xxx: better prompt here (why not progress bar?)
export function LocaleTab() {
	const user = useUser();

	return (
		<div className="stack md">
			<LanguageSelector />
			<GameLanguageSelector />
			{user ? (
				<SendouForm
					schema={clockFormatSchema}
					defaultValues={{
						newValue: user.preferences.clockFormat ?? "auto",
					}}
					mode="autoSubmit"
					revalidateRoot
					fullWidth
				>
					{({ FormField }) => <FormField name="newValue" />}
				</SendouForm>
			) : null}
		</div>
	);
}

function LanguageSelector() {
	const { t, i18n } = useTranslation(["common"]);
	const [, setLng] = useSearchParam(languageSearchParams, "lng");

	const languageItems = languages.map((lang) => ({
		value: lang.code,
		label: lang.name,
	}));

	const handleLanguageChange = (newLang: LanguageCode | null) => {
		if (!newLang) return;
		setLng(newLang, { replace: false });
	};

	return (
		<div className="stack xs">
			<SelectFormField
				label={t("common:header.language")}
				items={languageItems}
				value={i18n.language as LanguageCode}
				onChange={handleLanguageChange}
			/>
			<Link to={TRANSLATE_PAGE} className="text-xs">
				Help translate sendou.ink
			</Link>
		</div>
	);
}

function GameLanguageSelector() {
	const { t } = useTranslation(["settings"]);
	const [root] = useMatches();
	const rootData = root.loaderData as RootLoaderData | undefined;
	const [, setGameLng] = useSearchParam(languageSearchParams, "gameLng");

	const languageItems = gameLanguages.map((lang) => ({
		value: lang.code,
		label: lang.name,
	}));

	const handleLanguageChange = (newLang: GameLanguageCode | null) => {
		if (!newLang) return;
		setGameLng(newLang, { replace: false });
	};

	return (
		<SelectFormField
			label={t("settings:locale.gameLanguage")}
			bottomText={t("settings:locale.gameLanguage.bottomText")}
			items={languageItems}
			value={rootData?.gameLanguage ?? null}
			onChange={handleLanguageChange}
		/>
	);
}

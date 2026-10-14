import type { LoaderFunctionArgs } from "react-router";
import { getUser } from "~/features/auth/core/user.server";
import * as MatchProfileRepository from "~/features/match-profile/MatchProfileRepository.server";
import * as TranslationCatalog from "~/features/translate/core/TranslationCatalog.server";

export const loader = async (_args: LoaderFunctionArgs) => {
	const user = getUser();
	const translationProgress = TranslationCatalog.progressByLanguage();

	if (!user) {
		return { matchProfile: null, translationProgress };
	}

	const matchProfile = await MatchProfileRepository.findSettingsByUserId(
		user.id,
	);

	return { matchProfile, translationProgress };
};

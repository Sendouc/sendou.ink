import * as React from "react";
import { useTranslation } from "react-i18next";
import { SUPPORT_PAGE } from "~/utils/urls";
import { LinkButton } from "../Button";
import { HeartIcon } from "../icons/Heart";
import { AnythingAdder } from "./AnythingAdder";
import { LanguageChanger } from "./LanguageChanger";
import { ThemeChanger } from "./ThemeChanger";
import { UserItem } from "./UserItem";

export function _TopRightButtons({
	showSupport,
	isErrored,
}: {
	showSupport: boolean;
	isErrored: boolean;
}) {
	const { t } = useTranslation(["common"]);

	return (
		<div className="layout__header__right-container">
			{showSupport ? (
				<LinkButton
					to={SUPPORT_PAGE}
					size="tiny"
					icon={<HeartIcon />}
					variant="outlined"
				>
					{t("common:pages.support")}
				</LinkButton>
			) : null}
			<LanguageChanger />
			<ThemeChanger />
			<AnythingAdder />
			{!isErrored ? <UserItem /> : null}
		</div>
	);
}

export const TopRightButtons = React.memo(_TopRightButtons);

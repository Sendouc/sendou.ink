import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import navItems from "~/components/layout/nav-items.json";
import { useUser } from "~/features/auth/core/user";
import { useTheme } from "~/features/theme/core/provider";
import { languages } from "~/modules/i18n/config";
import { navIconUrl, userPage } from "~/utils/urls";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { Dialog } from "../Dialog";
import { Image } from "../Image";
import { CrossIcon } from "../icons/Cross";
import { GlobeIcon } from "../icons/Globe";
import { LogInIcon } from "../icons/LogIn";
import { LanguageChanger } from "./LanguageChanger";
import { LogInButtonContainer } from "./LogInButtonContainer";
import { SelectedThemeIcon } from "./SelectedThemeIcon";
import { ThemeChanger } from "./ThemeChanger";

// xxx: hamburger fab should show if no side nav
// xxx: popover hidden underneath

export function MobileNavDialog({
	isOpen,
	close,
}: { isOpen: boolean; close: () => void }) {
	const { userTheme } = useTheme();
	const { t, i18n } = useTranslation(["common"]);

	const selectedLanguage = languages.find(
		(lang) => i18n.language === lang.code,
	);

	return (
		<Dialog isOpen={isOpen} className="layout__mobile-nav__dialog">
			<Button
				icon={<CrossIcon />}
				variant="minimal-destructive"
				className="layout__mobile-nav__close-button"
				onClick={close}
				aria-label="Close navigation dialog"
			/>
			<div className="layout__mobile-nav__nav-items-container">
				<div className="layout__mobile-nav__nav-item round">
					<LanguageChanger plain>
						<div className="layout__mobile-nav__nav-image-container round">
							<GlobeIcon size={28} alt={t("common:header.language")} />
						</div>
					</LanguageChanger>
					{selectedLanguage?.name ?? ""}
				</div>

				<div className="layout__mobile-nav__nav-item round">
					<ThemeChanger plain>
						<div className="layout__mobile-nav__nav-image-container round">
							<SelectedThemeIcon size={28} />
						</div>
					</ThemeChanger>
					{t(`common:theme.${userTheme ?? "auto"}`)}
				</div>
				<LogInButton close={close} />
				{navItems.map((item) => (
					<Link
						to={`/${item.url}`}
						className="layout__mobile-nav__nav-item"
						key={item.name}
						prefetch={item.prefetch ? "render" : undefined}
						onClick={close}
					>
						<div className="layout__mobile-nav__nav-image-container">
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
		</Dialog>
	);
}

function LogInButton({ close }: { close: () => void }) {
	const { t } = useTranslation(["common"]);
	const user = useUser();

	if (user) {
		return (
			<Link
				to={userPage(user)}
				className="layout__mobile-nav__nav-item round"
				onClick={close}
			>
				<Avatar
					user={user}
					alt={t("common:header.loggedInAs", {
						userName: `${user.username}`,
					})}
					className="layout__mobile-nav__avatar"
					size="sm"
				/>
				{t("common:pages.myPage")}
			</Link>
		);
	}

	return (
		<div className="layout__mobile-nav__nav-item round">
			<LogInButtonContainer>
				<button className="layout__mobile-nav__log-in-button" type="submit">
					<LogInIcon size={28} />
				</button>
			</LogInButtonContainer>
			{t("common:header.login")}
		</div>
	);
}

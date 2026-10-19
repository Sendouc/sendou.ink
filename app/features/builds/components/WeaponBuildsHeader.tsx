import { ChartColumnBig, Flame, LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BackLink } from "~/components/BackLink";
import { CircleBackdrop } from "~/components/CircleBackdrop";
import { Image, WeaponImage } from "~/components/Image";
import { PageHeader } from "~/components/PageHeader";
import { SubNav, SubNavLink } from "~/components/SubNav";
import type { WeaponLandingState } from "~/components/WeaponLanding";
import { weaponLandingSearchParams } from "~/components/weapon-landing-search-params";
import { buildStatsSearchParams } from "~/features/build-stats/build-stats-search-params";
import type { MainWeaponId } from "~/modules/in-game-lists/types";
import { weaponIdToCategory } from "~/modules/in-game-lists/weapon-ids";
import { useSearchParamsTyped } from "~/modules/search-params/hooks";
import {
	BUILDS_PAGE,
	navIconUrl,
	weaponBuildPage,
	weaponBuildPopularPage,
	weaponBuildStatsPage,
} from "~/utils/urls";
import styles from "./WeaponBuildsHeader.module.css";

/** Header of a weapon's build pages with navigation between its builds, ability stats and popular builds. */
export function WeaponBuildsHeader({
	weaponId,
	weaponName,
	slug,
	buildsCount,
}: {
	weaponId: MainWeaponId;
	weaponName: string;
	slug: string;
	buildsCount: number;
}) {
	const { t } = useTranslation(["common", "builds"]);
	// the stats tabs share their date filter, so switching between them keeps it
	const [{ date }] = useSearchParamsTyped(buildStatsSearchParams);

	return (
		<div className="stack md">
			<PageHeader
				image={
					<CircleBackdrop>
						<WeaponImage weaponSplId={weaponId} variant="build" size={36} />
					</CircleBackdrop>
				}
				title={weaponName}
				subtitle={
					<>
						<Image path={navIconUrl("builds")} size={16} alt="" />
						{t("common:pages.builds")}
					</>
				}
				back={
					<BackLink
						to={weaponLandingSearchParams.href(BUILDS_PAGE, {
							category: weaponIdToCategory(weaponId),
						})}
						state={{ focusSearch: true } satisfies WeaponLandingState}
					/>
				}
			/>
			<SubNav className={styles.subNav}>
				<SubNavLink to={weaponBuildPage(slug)} className={styles.link}>
					<LayoutGrid size={14} />
					{t("builds:linkButton.allBuilds")}
					<span className="text-theme">{buildsCount}</span>
				</SubNavLink>
				<SubNavLink
					to={buildStatsSearchParams.href(weaponBuildStatsPage(slug), { date })}
					className={styles.link}
				>
					<ChartColumnBig size={14} />
					{t("builds:linkButton.abilityStats")}
				</SubNavLink>
				<SubNavLink
					to={buildStatsSearchParams.href(weaponBuildPopularPage(slug), {
						date,
					})}
					className={styles.link}
				>
					<Flame size={14} />
					{t("builds:linkButton.popularBuilds")}
				</SubNavLink>
			</SubNav>
		</div>
	);
}

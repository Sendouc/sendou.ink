import clsx from "clsx";
import { ChartColumnBig, Flame } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import type { MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { BackLink } from "~/components/BackLink";
import { BuildCard } from "~/components/BuildCard";
import { CircleBackdrop } from "~/components/CircleBackdrop";
import { EmptyState } from "~/components/EmptyState";
import { LinkButton } from "~/components/elements/Button";
import { Flipper } from "~/components/Flipper";
import { Image, WeaponImage } from "~/components/Image";
import { Main } from "~/components/Main";
import { PageHeader } from "~/components/PageHeader";
import type { WeaponLandingState } from "~/components/WeaponLanding";
import { weaponLandingSearchParams } from "~/components/weapon-landing-search-params";
import type { MainWeaponId } from "~/modules/in-game-lists/types";
import {
	canonicalWeaponSplId,
	weaponIdToCategory,
} from "~/modules/in-game-lists/weapon-ids";
import { useSearchParamsTyped } from "~/modules/search-params/hooks";
import { metaTags, ogPageImage, type SerializeFrom } from "~/utils/remix";
import type { SendouRouteHandle } from "~/utils/remix.server";
import {
	BUILDS_PAGE,
	navIconUrl,
	outlinedMainWeaponImageUrl,
	weaponBuildPage,
	weaponBuildPopularPage,
	weaponBuildStatsPage,
} from "~/utils/urls";
import {
	BUILDS_PAGE_BATCH_SIZE,
	BUILDS_PAGE_MAX_BUILDS,
} from "../builds-constants";
import { buildsSearchParams } from "../builds-search-params";
import type { BuildWeaponWithTop500Info } from "../builds-types";
import { BuildFiltersLayout } from "../components/BuildFilters";
import { BuildStack } from "../components/BuildStack";
import { loader } from "../loaders/builds.$slug.server";
import styles from "./builds.$slug.module.css";

export { loader };

export const shouldRevalidate = buildsSearchParams.shouldRevalidate;

export const meta: MetaFunction<typeof loader> = (args) => {
	if (!args.loaderData) return [];

	return metaTags({
		title: `${args.loaderData.weaponName} builds`,
		ogTitle: `${args.loaderData.weaponName} Splatoon 3 builds`,
		description: `Collection of ${args.loaderData.weaponName} builds from the top competitive players. Find the best combination of abilities and level up your gameplay.`,
		image: ogPageImage("builds"),
		location: args.location,
	});
};

export const handle: SendouRouteHandle = {
	i18n: ["weapons", "builds", "gear", "analyzer"],
	breadcrumb: ({ match }) => {
		const data = match.loaderData as SerializeFrom<typeof loader> | undefined;

		if (!data) return [];

		return [
			{
				imgPath: navIconUrl("builds"),
				href: BUILDS_PAGE,
				type: "IMAGE",
			},
			{
				imgPath: outlinedMainWeaponImageUrl(data.weaponId),
				href: weaponBuildPage(data.slug),
				type: "IMAGE",
			},
		];
	},
};

function BuildCards({ data }: { data: SerializeFrom<typeof loader> }) {
	const [expandedOwnerIds, setExpandedOwnerIds] = React.useState<
		ReadonlySet<number>
	>(new Set());

	const toggleExpanded = (ownerId: number) =>
		setExpandedOwnerIds((ownerIds) => {
			const newOwnerIds = new Set(ownerIds);
			if (newOwnerIds.has(ownerId)) {
				newOwnerIds.delete(ownerId);
			} else {
				newOwnerIds.add(ownerId);
			}

			return newOwnerIds;
		});

	const card =
		(build: SerializeFrom<typeof loader>["builds"][number]) =>
		(stackToggle: React.ReactNode) => (
			<BuildCard
				build={{
					...build,
					weapons: viewedWeaponFirst(build.weapons, data.weaponId),
				}}
				owner={{ ...build.owner, plusTier: build.plusTier }}
				ownerAction={stackToggle}
				canEdit={false}
			/>
		);

	return (
		<Flipper flipKey={expandedOwnerIds} className={styles.buildsContainer}>
			{groupByOwner(data.builds).flatMap(([build, ...otherBuilds]) => {
				const isExpanded = expandedOwnerIds.has(build.owner.id);

				return [
					<BuildStack
						key={build.id}
						buildId={build.id}
						stack={
							otherBuilds.length > 0
								? {
										buildIds: otherBuilds.map((b) => b.id),
										isExpanded,
										onToggle: () => toggleExpanded(build.owner.id),
									}
								: undefined
						}
					>
						{card(build)}
					</BuildStack>,
					...(isExpanded
						? otherBuilds.map((otherBuild) => (
								<BuildStack key={otherBuild.id} buildId={otherBuild.id}>
									{card(otherBuild)}
								</BuildStack>
							))
						: []),
				];
			})}
		</Flipper>
	);
}

export default function WeaponsBuildsPage() {
	const data = useLoaderData<typeof loader>();
	const { t } = useTranslation(["common", "builds"]);
	const [{ abilities: abilityConditions, mode, date }] =
		useSearchParamsTyped(buildsSearchParams);

	const loadMoreLink = () =>
		buildsSearchParams.href(weaponBuildPage(data.slug), {
			limit: data.limit + BUILDS_PAGE_BATCH_SIZE,
			abilities: abilityConditions,
			mode,
			date,
		});

	const hasFilters =
		abilityConditions.length > 0 || mode !== null || date !== null;

	return (
		<Main className={clsx("stack lg", styles.main)}>
			<PageHeader
				image={
					<CircleBackdrop>
						<WeaponImage
							weaponSplId={data.weaponId}
							variant="build"
							size={36}
						/>
					</CircleBackdrop>
				}
				title={data.weaponName}
				subtitle={
					<>
						<Image path={navIconUrl("builds")} size={16} alt="" />
						{t("common:pages.builds")}
					</>
				}
				backPosition="start"
				back={
					<BackLink
						iconOnly
						to={weaponLandingSearchParams.href(BUILDS_PAGE, {
							category: weaponIdToCategory(data.weaponId),
						})}
						state={{ focusSearch: true } satisfies WeaponLandingState}
					/>
				}
			>
				<LinkButton
					to={weaponBuildStatsPage(data.slug)}
					variant="outlined"
					icon={<ChartColumnBig />}
				>
					{t("builds:linkButton.abilityStats")}
				</LinkButton>
				<LinkButton
					to={weaponBuildPopularPage(data.slug)}
					variant="outlined"
					icon={<Flame />}
				>
					{t("builds:linkButton.popularBuilds")}
				</LinkButton>
			</PageHeader>
			<BuildFiltersLayout>
				{data.builds.length > 0 ? (
					<BuildCards data={data} />
				) : (
					<EmptyState navItem="builds">
						{hasFilters
							? t("builds:noBuildsMatchingFilters")
							: t("builds:noBuildsForWeapon")}
					</EmptyState>
				)}
				{data.limit < BUILDS_PAGE_MAX_BUILDS && data.hasMoreBuilds ? (
					<LinkButton
						className="m-0-auto"
						size="small"
						to={loadMoreLink()}
						preventScrollReset
					>
						{t("common:actions.loadMore")}
					</LinkButton>
				) : null}
			</BuildFiltersLayout>
		</Main>
	);
}

function viewedWeaponFirst(
	weapons: Array<BuildWeaponWithTop500Info>,
	viewedWeaponId: MainWeaponId,
) {
	const isViewed = (weapon: BuildWeaponWithTop500Info) =>
		canonicalWeaponSplId(weapon.weaponSplId) === viewedWeaponId;

	return [...weapons.filter(isViewed), ...weapons.filter((w) => !isViewed(w))];
}

/** Groups in the order each owner first appears, so a stack takes the place of its owner's top build. */
function groupByOwner<T extends { owner: { id: number } }>(builds: T[]) {
	const groups = new Map<number, [T, ...T[]]>();
	for (const build of builds) {
		const group = groups.get(build.owner.id);
		if (group) {
			group.push(build);
		} else {
			groups.set(build.owner.id, [build]);
		}
	}

	return [...groups.values()];
}

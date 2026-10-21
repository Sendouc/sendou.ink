import {
	ArrowDownNarrowWide,
	Crosshair,
	Eye,
	Lock,
	LockOpen,
	Search,
	Trash,
} from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useFetcher, useLoaderData } from "react-router";
import * as R from "remeda";
import { BuildCard } from "~/components/BuildCard";
import { EmptyState } from "~/components/EmptyState";
import { SendouButton } from "~/components/elements/Button";
import { SendouDialog } from "~/components/elements/Dialog";
import { FormMessage } from "~/components/FormMessage";
import type { FilterLayoutFilter } from "~/components/filter-layout/FilterLayout";
import { Image, WeaponImage } from "~/components/Image";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";
import { useUser } from "~/features/auth/core/user";
import {
	BuildFilterRadioGroup,
	BuildFilterRadioOption,
	BuildFiltersLayout,
	ClearFiltersButton,
} from "~/features/builds/components/BuildFilters";
import {
	BUILD_SORT_IDENTIFIERS,
	type BuildSort,
	type BuildVisibility,
} from "~/features/user-page/user-page-constants";
import { buildsActionSchema } from "~/features/user-page/user-page-schemas";
import { useSearchParamPagination } from "~/hooks/useSearchParamPagination";
import type { MainWeaponId } from "~/modules/in-game-lists/types";
import { filterWeapon } from "~/modules/in-game-lists/utils";
import { mainWeaponIds } from "~/modules/in-game-lists/weapon-ids";
import { hasPermission } from "~/modules/permissions/utils";
import { useSearchParamsTyped } from "~/modules/search-params/hooks";
import type { SendouRouteHandle } from "~/utils/remix.server";
import { weaponCategoryUrl } from "~/utils/urls";
import { action } from "../actions/u.$identifier.builds.server";
import { SubPageHeader } from "../components/SubPageHeader";
import { loader } from "../loaders/u.$identifier.builds.server";
import { DEFAULT_BUILD_SORT } from "../user-page-constants";
import { useUserPageLayoutData } from "../user-page-hooks";
import { userBuildsSearchParams } from "../user-page-search-params";
import styles from "./u.$identifier.builds.module.css";

export { action, loader };

const WEAPON_FILTER_COLLAPSED_COUNT = 8;

export const shouldRevalidate = userBuildsSearchParams.shouldRevalidate;

export const handle: SendouRouteHandle = {
	i18n: ["weapons", "builds", "gear", "analyzer"],
};

export default function UserBuildsPage() {
	const { t } = useTranslation(["builds", "user", "common", "weapons"]);
	const user = useUser();
	const layoutData = useUserPageLayoutData();
	const data = useLoaderData<typeof loader>();
	const [{ weapon, visibility, abilities, mode, date, sorting }, setParams] =
		useSearchParamsTyped(userBuildsSearchParams);
	const pagination = useSearchParamPagination({
		definition: userBuildsSearchParams,
		currentPage: data.currentPage,
		pagesCount: data.pagesCount,
	});

	const isOwnPage = user?.id === layoutData.user.id;
	const changingSorting = sorting && isOwnPage;
	// here so closing the dialog mid-submit doesn't unmount the fetcher and drop the revalidation
	const sortingFetcher = useFetcher();

	const closeSortingDialog = () => setParams({ sorting: false });

	const showVisibilityFilter = data.counts.private > 0;

	const hasFilters =
		weapon !== null ||
		(showVisibilityFilter && visibility !== null) ||
		abilities.length > 0 ||
		mode !== null ||
		date !== null;
	const clearFilters = () =>
		setParams({
			weapon: null,
			visibility: null,
			abilities: [],
			mode: null,
			date: null,
		});

	const leadingFilters: FilterLayoutFilter[] = [
		{
			key: "weapon",
			name: t("builds:filters.weapon"),
			icon: <Crosshair />,
			formattedValue: weapon !== null ? t(`weapons:MAIN_${weapon}`) : null,
			testId: "weapon-filter",
			content: (
				<WeaponFilter
					weapon={weapon}
					onChange={(newWeapon) => setParams({ weapon: newWeapon })}
				/>
			),
		},
	];
	if (showVisibilityFilter) {
		leadingFilters.push({
			key: "visibility",
			name: t("builds:filters.visibility"),
			icon: <Eye />,
			formattedValue:
				visibility !== null
					? t(`builds:stats.${visibility === "PUBLIC" ? "public" : "private"}`)
					: null,
			testId: "visibility-filter",
			content: (
				<VisibilityFilter
					visibility={visibility}
					onChange={(newVisibility) => setParams({ visibility: newVisibility })}
				/>
			),
		});
	}

	const buildCards =
		data.builds.length > 0 ? (
			<div className={styles.buildsContainer}>
				{data.builds.map((build) => (
					<BuildCard
						key={build.id}
						build={build}
						owner={layoutData.user}
						showOwner={false}
						canEdit={hasPermission(build, "EDIT", user)}
					/>
				))}
			</div>
		) : (
			<EmptyState
				navItem="builds"
				action={
					hasFilters ? <ClearFiltersButton onClick={clearFilters} /> : null
				}
			>
				{hasFilters ? t("noBuildsMatchingFilters") : t("noBuilds")}
			</EmptyState>
		);

	return (
		<div className="stack lg">
			{changingSorting ? (
				<ChangeSortingDialog
					close={closeSortingDialog}
					fetcher={sortingFetcher}
				/>
			) : null}
			<SubPageHeader user={layoutData.user} title={t("common:pages.builds")}>
				{isOwnPage && data.counts.total > 0 ? (
					<SendouButton
						onClick={() => setParams({ sorting: true })}
						size="small"
						variant="outlined"
						icon={<ArrowDownNarrowWide />}
						data-testid="change-sorting-button"
					>
						{t("user:builds.sorting.changeButton")}
					</SendouButton>
				) : null}
			</SubPageHeader>
			{data.counts.total > 0 ? (
				<BuildFiltersLayout
					values={{ abilities, mode, date }}
					onChange={setParams}
					onClearAll={clearFilters}
					leadingFilters={leadingFilters}
					filteredBuildsCount={data.filteredBuildsCount}
					pagination={pagination}
				>
					{buildCards}
				</BuildFiltersLayout>
			) : (
				buildCards
			)}
		</div>
	);
}

const MISSING_SORT_VALUE = "null";
function ChangeSortingDialog({
	close,
	fetcher,
}: {
	close: () => void;
	fetcher: ReturnType<typeof useFetcher>;
}) {
	const data = useLoaderData<typeof loader>();
	const [buildSorting, setBuildSorting] = React.useState<
		ReadonlyArray<BuildSort | null>
	>(() => {
		if (!data.buildSorting) return [...DEFAULT_BUILD_SORT, null];
		if (data.buildSorting.length === BUILD_SORT_IDENTIFIERS.length)
			return data.buildSorting;

		return [...data.buildSorting, null];
	});
	const { t } = useTranslation(["common", "user"]);

	const canAddMoreSorting = buildSorting.length < BUILD_SORT_IDENTIFIERS.length;

	const changeSorting = (idx: number, newIdentifier: BuildSort | null) => {
		const newSorting = buildSorting.map((oldIdentifier, i) =>
			i === idx ? newIdentifier : oldIdentifier,
		);

		if (canAddMoreSorting && newSorting[newSorting.length - 1] !== null) {
			newSorting.push(null);
		}

		setBuildSorting(newSorting);
	};

	const deleteLastSorting = () => {
		setBuildSorting((prev) => [...prev.filter(Boolean).slice(0, -1), null]);
	};

	return (
		<SendouDialog heading={t("user:builds.sorting.header")} onClose={close}>
			<fetcher.Form method="post" onSubmit={() => close()}>
				<input
					type="hidden"
					name="buildSorting"
					value={JSON.stringify(buildSorting.filter(Boolean))}
				/>
				<div className="stack lg">
					<div className="stack md">
						<FormMessage type="info">
							{t("user:builds.sorting.info")}
						</FormMessage>
						<SendouButton
							className="ml-auto"
							variant="minimal"
							size="small"
							onClick={() => setBuildSorting([...DEFAULT_BUILD_SORT, null])}
						>
							{t("user:builds.sorting.backToDefaults")}
						</SendouButton>
						{buildSorting.map((sort, i) => {
							const isLast = i === buildSorting.length - 1;
							const isSecondToLast = i === buildSorting.length - 2;

							if (isLast && canAddMoreSorting) {
								return (
									<ChangeSortingDialogSelect
										key={i}
										identifiers={BUILD_SORT_IDENTIFIERS.filter(
											(identifier) =>
												!buildSorting.slice(0, -1).includes(identifier),
										)}
										value={sort}
										changeValue={(newValue) => changeSorting(i, newValue)}
									/>
								);
							}

							return (
								<div
									key={i}
									className="stack horizontal justify-between items-center"
								>
									<div className="font-bold">
										{i + 1}) {t(`user:builds.sorting.${sort!}`)}
									</div>
									{(isLast && !canAddMoreSorting) ||
									(canAddMoreSorting && isSecondToLast) ? (
										<SendouButton
											size="small"
											icon={<Trash />}
											variant="minimal-destructive"
											onClick={deleteLastSorting}
											data-testid="delete-sorting-button"
										/>
									) : null}
								</div>
							);
						})}
					</div>

					<div>
						<SubmitButton schema={buildsActionSchema} _action="UPDATE_SORTING">
							{t("common:actions.save")}
						</SubmitButton>
					</div>
				</div>
			</fetcher.Form>
		</SendouDialog>
	);
}

function ChangeSortingDialogSelect({
	identifiers,
	value,
	changeValue,
}: {
	identifiers: BuildSort[];
	value: BuildSort | null;
	changeValue: (value: BuildSort | null) => void;
}) {
	const { t } = useTranslation(["user"]);

	return (
		<select
			value={value ?? MISSING_SORT_VALUE}
			onChange={(e) => {
				if (e.target.value === MISSING_SORT_VALUE) changeValue(null);

				changeValue(e.target.value as BuildSort);
			}}
		>
			<option value={MISSING_SORT_VALUE}>-</option>
			{identifiers.map((identifier) => {
				return (
					<option key={identifier} value={identifier}>
						{t(`user:builds.sorting.${identifier}`)}
					</option>
				);
			})}
		</select>
	);
}

function WeaponFilter({
	weapon,
	onChange,
}: {
	weapon: MainWeaponId | null;
	onChange: (weapon: MainWeaponId | null) => void;
}) {
	const { t } = useTranslation(["weapons", "builds", "common"]);
	const data = useLoaderData<typeof loader>();
	const name = React.useId();
	const [searchTerm, setSearchTerm] = React.useState("");
	const [showAll, setShowAll] = React.useState(false);

	const buildCount = (weaponId: MainWeaponId) =>
		data.counts.byWeaponId[weaponId] ?? 0;
	const weaponIdsByBuildCount = R.sortBy(
		mainWeaponIds.filter((weaponId) => buildCount(weaponId) > 0),
		[buildCount, "desc"],
	);
	const isCollapsible =
		weaponIdsByBuildCount.length > WEAPON_FILTER_COLLAPSED_COUNT;
	const isSearching = searchTerm !== "";

	const shownWeaponIds = isSearching
		? weaponIdsByBuildCount.filter((weaponId) =>
				filterWeapon({
					weapon: { type: "MAIN", id: weaponId },
					weaponName: t(`weapons:MAIN_${weaponId}`),
					searchTerm,
				}),
			)
		: weaponIdsByBuildCount.filter(
				(weaponId, i) =>
					showAll || i < WEAPON_FILTER_COLLAPSED_COUNT || weaponId === weapon,
			);
	const hasHiddenWeapons =
		!isSearching && shownWeaponIds.length < weaponIdsByBuildCount.length;

	return (
		<div className="stack sm">
			{isCollapsible ? (
				<Input
					type="search"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder={t("common:forms.weaponSearch.search.placeholder")}
					aria-label={t("common:forms.weaponSearch.search.placeholder")}
					icon={<Search aria-hidden />}
					testId="weapon-filter-search"
				/>
			) : null}
			<BuildFilterRadioGroup label={t("builds:filters.weapon")}>
				<BuildFilterRadioOption
					name={name}
					checked={weapon === null}
					onChange={() => onChange(null)}
					icon={<Image path={weaponCategoryUrl("SHOOTERS")} size={20} alt="" />}
					sub={String(data.counts.total)}
				>
					{t("builds:filters.weapon.any")}
				</BuildFilterRadioOption>
				{shownWeaponIds.map((weaponId) => (
					<BuildFilterRadioOption
						key={weaponId}
						name={name}
						checked={weapon === weaponId}
						onChange={() => onChange(weaponId)}
						icon={
							<WeaponImage weaponSplId={weaponId} variant="badge" size={20} />
						}
						sub={String(buildCount(weaponId))}
					>
						{t(`weapons:MAIN_${weaponId}`)}
					</BuildFilterRadioOption>
				))}
			</BuildFilterRadioGroup>
			{isSearching && shownWeaponIds.length === 0 ? (
				<div className="text-xs text-lighter text-center">
					{t("common:noResults")}
				</div>
			) : null}
			{hasHiddenWeapons ? (
				<SendouButton
					variant="minimal"
					size="small"
					onClick={() => setShowAll(true)}
				>
					{t("common:actions.showAll")} ({weaponIdsByBuildCount.length})
				</SendouButton>
			) : null}
		</div>
	);
}

function VisibilityFilter({
	visibility,
	onChange,
}: {
	visibility: BuildVisibility | null;
	onChange: (visibility: BuildVisibility | null) => void;
}) {
	const { t } = useTranslation(["builds"]);
	const data = useLoaderData<typeof loader>();
	const name = React.useId();

	return (
		<BuildFilterRadioGroup label={t("builds:filters.visibility")}>
			<BuildFilterRadioOption
				name={name}
				checked={visibility === null}
				onChange={() => onChange(null)}
				sub={String(data.counts.total)}
			>
				{t("builds:stats.all")}
			</BuildFilterRadioOption>
			<BuildFilterRadioOption
				name={name}
				checked={visibility === "PUBLIC"}
				onChange={() => onChange("PUBLIC")}
				icon={<LockOpen size={16} />}
				sub={String(data.counts.total - data.counts.private)}
			>
				{t("builds:stats.public")}
			</BuildFilterRadioOption>
			<BuildFilterRadioOption
				name={name}
				checked={visibility === "PRIVATE"}
				onChange={() => onChange("PRIVATE")}
				icon={<Lock size={16} />}
				sub={String(data.counts.private)}
			>
				{t("builds:stats.private")}
			</BuildFilterRadioOption>
		</BuildFilterRadioGroup>
	);
}

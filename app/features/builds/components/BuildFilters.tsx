import clsx from "clsx";
import { Calendar, FlaskConical, Map as MapIcon } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import {
	AbilityPalette,
	AbilityPaletteButton,
} from "~/components/AbilityPalette";
import {
	FilterLayout,
	type FilterLayoutFilter,
} from "~/components/filter-layout/FilterLayout";
import { Image } from "~/components/Image";
import { Pagination } from "~/components/Pagination";
import { useDateTimeFormat } from "~/hooks/intl/useDateTimeFormat";
import { abilities } from "~/modules/in-game-lists/abilities";
import { modesShort, rankedModesShort } from "~/modules/in-game-lists/modes";
import type {
	Ability as AbilityType,
	ModeShort,
} from "~/modules/in-game-lists/types";
import { modeImageUrl } from "~/utils/urls";
import { MAX_BUILD_FILTERS, RECENT_PATCHES } from "../builds-constants";
import styles from "./BuildFilters.module.css";

interface BuildFilterValues {
	abilities: AbilityType[];
	mode: ModeShort | null;
	date: string | null;
}

/** Build filters (mode, abilities & date, plus any `leadingFilters`) around the build results. */
export function BuildFiltersLayout({
	values: { abilities: selectedAbilities, mode, date },
	onChange: setParams,
	onClearAll,
	leadingFilters = [],
	pagination,
	children,
}: {
	values: BuildFilterValues;
	onChange: (newValues: Partial<BuildFilterValues>) => void;
	/** Resets every filter, including `leadingFilters`. */
	onClearAll: () => void;
	leadingFilters?: FilterLayoutFilter[];
	/** Shown below the results when there is more than one page. */
	pagination: React.ComponentProps<typeof Pagination>;
	children: React.ReactNode;
}) {
	const { t } = useTranslation(["builds", "game-misc"]);

	return (
		<FilterLayout
			filters={[
				...leadingFilters,
				{
					key: "mode",
					name: t("builds:filters.mode"),
					icon: <MapIcon />,
					formattedValue:
						mode !== null ? t(`game-misc:MODE_LONG_${mode}`) : null,
					testId: "mode-filter",
					content: (
						<ModeFilter
							mode={mode}
							onChange={(newMode) => setParams({ mode: newMode })}
						/>
					),
				},
				{
					key: "abilities",
					name: t("builds:filters.abilities"),
					icon: <FlaskConical />,
					formattedValue:
						selectedAbilities.length > 0
							? `${selectedAbilities.length} / ${MAX_BUILD_FILTERS}`
							: null,
					activeLabels: selectedAbilities.map((ability) =>
						t(`game-misc:ABILITY_${ability}`),
					),
					testId: "ability-filter",
					content: (
						<AbilitiesFilter
							selectedAbilities={selectedAbilities}
							onChange={(newAbilities) =>
								setParams({ abilities: newAbilities })
							}
						/>
					),
				},
				{
					key: "date",
					name: t("builds:filters.updatedSince"),
					icon: <Calendar />,
					formattedValue: date !== null ? formatFilterDate(date) : null,
					activeLabels:
						date !== null
							? [`${t("builds:filters.date.since")} ${formatFilterDate(date)}`]
							: [],
					testId: "date-filter",
					content: (
						<DateFilter
							date={date}
							onChange={(newDate) => setParams({ date: newDate })}
						/>
					),
				},
			]}
			onClearAll={onClearAll}
			showResultsText={t("builds:filters.showBuilds")}
		>
			{children}
			{pagination.pagesCount > 1 ? <Pagination {...pagination} /> : null}
		</FilterLayout>
	);
}

function ModeFilter({
	mode,
	onChange,
}: {
	mode: ModeShort | null;
	onChange: (mode: ModeShort | null) => void;
}) {
	const { t } = useTranslation(["builds", "game-misc"]);
	const name = React.useId();

	return (
		<div
			className={styles.modeOptions}
			role="radiogroup"
			aria-label={t("builds:filters.mode")}
		>
			<BuildFilterRadioOption
				name={name}
				checked={mode === null}
				onChange={() => onChange(null)}
				icon={<AnyModeIcon />}
			>
				{t("builds:filters.mode.any")}
			</BuildFilterRadioOption>
			{modesShort.map((option) => (
				<BuildFilterRadioOption
					key={option}
					name={name}
					checked={mode === option}
					onChange={() => onChange(option)}
					icon={<Image path={modeImageUrl(option)} size={20} alt="" />}
				>
					{t(`game-misc:MODE_LONG_${option}`)}
				</BuildFilterRadioOption>
			))}
		</div>
	);
}

function AnyModeIcon() {
	return (
		<div className={styles.anyModeIcon}>
			{rankedModesShort.map((mode) => (
				<Image key={mode} path={modeImageUrl(mode)} size={10} alt="" />
			))}
		</div>
	);
}

function AbilitiesFilter({
	selectedAbilities,
	onChange,
}: {
	selectedAbilities: AbilityType[];
	onChange: (abilities: AbilityType[]) => void;
}) {
	const isFull = selectedAbilities.length >= MAX_BUILD_FILTERS;
	const takenMainOnlyTypes = new Set<ReturnType<typeof abilityType>>(
		selectedAbilities.map(abilityType).filter((type) => type !== "STACKABLE"),
	);

	const toggleAbility = (ability: AbilityType) =>
		onChange(
			selectedAbilities.includes(ability)
				? selectedAbilities.filter((selected) => selected !== ability)
				: [...selectedAbilities, ability],
		);

	return (
		<AbilityPalette
			renderAbility={(ability) => {
				const isSelected = selectedAbilities.includes(ability);
				// a gear piece has only one main slot
				const isDisabled =
					!isSelected &&
					(isFull || takenMainOnlyTypes.has(abilityType(ability)));

				return (
					<AbilityPaletteButton
						key={ability}
						ability={ability}
						aria-pressed={isSelected}
						aria-disabled={isDisabled || undefined}
						onClick={() => toggleAbility(ability)}
					/>
				);
			}}
		/>
	);
}

function DateFilter({
	date,
	onChange,
}: {
	date: string | null;
	onChange: (date: string | null) => void;
}) {
	const { t } = useTranslation(["builds"]);
	const name = React.useId();
	const { formatter } = useDateTimeFormat({
		day: "numeric",
		month: "numeric",
		year: "numeric",
	});

	return (
		<BuildFilterRadioGroup label={t("builds:filters.updatedSince")}>
			<BuildFilterRadioOption
				name={name}
				checked={date === null}
				onChange={() => onChange(null)}
			>
				{t("builds:filters.date.anyTime")}
			</BuildFilterRadioOption>
			{RECENT_PATCHES.map((patch) => (
				<BuildFilterRadioOption
					key={patch.patch}
					name={name}
					checked={date === patch.date}
					onChange={() => onChange(patch.date)}
					sub={formatter.format(new Date(patch.date))}
				>
					{t("builds:filters.date.patch", { patch: patch.patch })}
				</BuildFilterRadioOption>
			))}
		</BuildFilterRadioGroup>
	);
}

/** Vertical list of `BuildFilterRadioOption`s. */
export function BuildFilterRadioGroup({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className={styles.optionList} role="radiogroup" aria-label={label}>
			{children}
		</div>
	);
}

/** Radio styled like the other build filter options. */
export function BuildFilterRadioOption({
	name,
	checked,
	onChange,
	icon,
	sub,
	children,
}: {
	name: string;
	checked: boolean;
	onChange: () => void;
	icon?: React.ReactNode;
	sub?: string;
	children: React.ReactNode;
}) {
	return (
		<label className={clsx(styles.option, { [styles.optionChecked]: checked })}>
			<input type="radio" name={name} checked={checked} onChange={onChange} />
			{icon}
			<span>{children}</span>
			{sub ? <span className={styles.optionSub}>{sub}</span> : null}
		</label>
	);
}

function formatFilterDate(date: string) {
	return RECENT_PATCHES.find((patch) => patch.date === date)?.patch ?? date;
}

function abilityType(ability: AbilityType) {
	return abilities.find((a) => a.name === ability)!.type;
}

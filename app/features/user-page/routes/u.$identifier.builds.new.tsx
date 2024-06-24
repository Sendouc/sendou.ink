import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import clone from "just-clone";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AbilitiesSelector } from "~/components/AbilitiesSelector";
import { Button } from "~/components/Button";
import { GearCombobox, WeaponCombobox } from "~/components/Combobox";
import { FormMessage } from "~/components/FormMessage";
import { Image } from "~/components/Image";
import { Label } from "~/components/Label";
import { RequiredHiddenInput } from "~/components/RequiredHiddenInput";
import { SubmitButton } from "~/components/SubmitButton";
import { CrossIcon } from "~/components/icons/Cross";
import { PlusIcon } from "~/components/icons/Plus";
import { BUILD } from "~/constants";
import type { GearType } from "~/db/types";
import {
	validatedBuildFromSearchParams,
	validatedWeaponIdFromSearchParams,
} from "~/features/build-analyzer";
import { modesShort } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import type {
	BuildAbilitiesTupleWithUnknown,
	MainWeaponId,
} from "~/modules/in-game-lists/types";
import type { SendouRouteHandle } from "~/utils/remix";
import { modeImageUrl } from "~/utils/urls";

import { action } from "../actions/u.$identifier.builds.new.server";
import { loader } from "../loaders/u.$identifier.builds.new.server";
export { loader, action };

export const handle: SendouRouteHandle = {
	i18n: ["weapons", "builds", "gear"],
};

export default function NewBuildPage() {
	const { buildToEdit } = useLoaderData<typeof loader>();
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const [abilities, setAbilities] =
		React.useState<BuildAbilitiesTupleWithUnknown>(
			buildToEdit?.abilities ?? validatedBuildFromSearchParams(searchParams),
		);

	return (
		<div className="half-width u__build-form">
			<Form className="stack md items-start" method="post">
				{buildToEdit && (
					<input type="hidden" name="buildToEditId" value={buildToEdit.id} />
				)}
				<WeaponsSelector />
				<GearSelector
					type="HEAD"
					abilities={abilities}
					setAbilities={setAbilities}
				/>
				<GearSelector
					type="CLOTHES"
					abilities={abilities}
					setAbilities={setAbilities}
				/>
				<GearSelector
					type="SHOES"
					abilities={abilities}
					setAbilities={setAbilities}
				/>
				<Abilities abilities={abilities} setAbilities={setAbilities} />
				<TitleInput />
				<DescriptionTextarea />
				<ModeCheckboxes />
				<PrivateCheckbox />
				<SubmitButton className="mt-4">{t("actions.submit")}</SubmitButton>
			</Form>
		</div>
	);
}

function TitleInput() {
	const { t } = useTranslation("builds");
	const { buildToEdit } = useLoaderData<typeof loader>();

	return (
		<div>
			<Label htmlFor="title" required>
				{t("forms.title")}
			</Label>
			<input
				id="title"
				name="title"
				required
				minLength={BUILD.TITLE_MIN_LENGTH}
				maxLength={BUILD.TITLE_MAX_LENGTH}
				defaultValue={buildToEdit?.title}
			/>
		</div>
	);
}

function DescriptionTextarea() {
	const { t } = useTranslation();
	const { buildToEdit } = useLoaderData<typeof loader>();
	const [value, setValue] = React.useState(buildToEdit?.description ?? "");

	return (
		<div>
			<Label
				htmlFor="description"
				valueLimits={{
					current: value.length,
					max: BUILD.DESCRIPTION_MAX_LENGTH,
				}}
			>
				{t("forms.description")}
			</Label>
			<textarea
				id="description"
				name="description"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				maxLength={BUILD.DESCRIPTION_MAX_LENGTH}
			/>
		</div>
	);
}

function ModeCheckboxes() {
	const { buildToEdit } = useLoaderData<typeof loader>();
	const { t } = useTranslation("builds");

	const modes = buildToEdit?.modes ?? rankedModesShort;

	return (
		<div>
			<Label>{t("forms.modes")}</Label>
			<div className="stack horizontal md">
				{modesShort.map((mode) => (
					<div key={mode} className="stack items-center">
						<label htmlFor={mode}>
							<Image alt="" path={modeImageUrl(mode)} width={24} height={24} />
						</label>
						<input
							id={mode}
							name={mode}
							type="checkbox"
							defaultChecked={modes.includes(mode)}
							data-testid={`${mode}-checkbox`}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

function PrivateCheckbox() {
	const { buildToEdit } = useLoaderData<typeof loader>();
	const { t } = useTranslation(["builds", "common"]);

	return (
		<div>
			<Label htmlFor="private">{t("common:build.private")}</Label>
			<input
				id="private"
				name="private"
				type="checkbox"
				defaultChecked={Boolean(buildToEdit?.private)}
			/>
			<FormMessage type="info" className="mt-0">
				{t("builds:forms.private.info")}
			</FormMessage>
		</div>
	);
}

function WeaponsSelector() {
	const [searchParams] = useSearchParams();
	const { buildToEdit } = useLoaderData<typeof loader>();
	const { t } = useTranslation(["common", "weapons", "builds"]);
	const [weapons, setWeapons] = React.useState(
		buildToEdit?.weapons.map((wpn) => wpn.weaponSplId) ?? [
			validatedWeaponIdFromSearchParams(searchParams),
		],
	);

	return (
		<div>
			<Label required htmlFor="weapon">
				{t("builds:forms.weapons")}
			</Label>
			<div className="stack sm">
				{weapons.map((weapon, i) => {
					return (
						<div key={i} className="stack horizontal sm items-center">
							<div>
								<WeaponCombobox
									inputName="weapon"
									id="weapon"
									className="u__build-form__weapon"
									required
									onChange={(opt) =>
										opt &&
										setWeapons((weapons) => {
											const newWeapons = [...weapons];
											newWeapons[i] = Number(opt.value) as MainWeaponId;
											return newWeapons;
										})
									}
									initialWeaponId={weapon ?? undefined}
								/>
							</div>
							{i === weapons.length - 1 && (
								<>
									<Button
										size="tiny"
										disabled={weapons.length === BUILD.MAX_WEAPONS_COUNT}
										onClick={() => setWeapons((weapons) => [...weapons, 0])}
										icon={<PlusIcon />}
										testId="add-weapon-button"
									/>
									{weapons.length > 1 && (
										<Button
											size="tiny"
											onClick={() =>
												setWeapons((weapons) => {
													const newWeapons = [...weapons];
													newWeapons.pop();
													return newWeapons;
												})
											}
											variant="destructive"
											icon={<CrossIcon />}
										/>
									)}
								</>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function GearSelector({
	type,
	abilities,
	setAbilities,
}: {
	type: GearType;
	abilities: BuildAbilitiesTupleWithUnknown;
	setAbilities: (abilities: BuildAbilitiesTupleWithUnknown) => void;
}) {
	const { buildToEdit, gearIdToAbilities } = useLoaderData<typeof loader>();
	const { t } = useTranslation("builds");

	const initialGearId = !buildToEdit
		? undefined
		: type === "HEAD"
			? buildToEdit.headGearSplId
			: type === "CLOTHES"
				? buildToEdit.clothesGearSplId
				: buildToEdit.shoesGearSplId;

	return (
		<div>
			<Label htmlFor={type} required>
				{t(`forms.gear.${type}`)}
			</Label>
			<div>
				<GearCombobox
					gearType={type}
					inputName={type}
					id={type}
					required
					initialGearId={initialGearId}
					// onChange only exists to copy abilities from existing gear
					// actual value of combobox is handled in uncontrolled manner
					onChange={(opt) => {
						if (!opt) return;

						const abilitiesFromExistingGear =
							gearIdToAbilities[`${type}_${opt.value}`];

						if (!abilitiesFromExistingGear) return;

						const gearIndex = type === "HEAD" ? 0 : type === "CLOTHES" ? 1 : 2;

						const currentAbilities = abilities[gearIndex];

						// let's not overwrite current selections
						if (!currentAbilities.every((a) => a === "UNKNOWN")) return;

						const newAbilities = clone(abilities);
						newAbilities[gearIndex] = abilitiesFromExistingGear;

						setAbilities(newAbilities);
					}}
				/>
			</div>
		</div>
	);
}

function Abilities({
	abilities,
	setAbilities,
}: {
	abilities: BuildAbilitiesTupleWithUnknown;
	setAbilities: (abilities: BuildAbilitiesTupleWithUnknown) => void;
}) {
	return (
		<div>
			<RequiredHiddenInput
				value={JSON.stringify(abilities)}
				isValid={abilities.flat().every((a) => a !== "UNKNOWN")}
				name="abilities"
			/>
			<AbilitiesSelector
				selectedAbilities={abilities}
				onChange={setAbilities}
			/>
		</div>
	);
}

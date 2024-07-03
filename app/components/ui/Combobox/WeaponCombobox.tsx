import clsx from "clsx";
import { Collection, ListBoxItem, Section } from "react-aria-components";
import { Image, WeaponImage } from "~/components/Image";
import type { MainWeaponId } from "~/modules/in-game-lists";
import {
	abilityImageUrl,
	mainWeaponImageUrl,
	weaponCategoryUrl,
} from "~/utils/urls";
import { MyComboBox, MyComboBoxHeader } from "./MyComboBox";
import { useComboboxState } from "./hooks/useComboboxState";
import { useWeaponFilter } from "./hooks/useWeaponFilter";
import { useWeaponOptions } from "./hooks/useWeaponOptions";

export function WeaponComboBox({
	id,
	name,
	isRequired,
	value,
	onChange,
	disabledWeaponIds,
	quickSelectWeaponIds,
	withRightButton = true,
	label,
}: {
	id?: string;
	name?: string;
	isRequired?: boolean;
	value?: MainWeaponId | null;
	onChange?: (weaponId: MainWeaponId | null) => void;
	disabledWeaponIds?: MainWeaponId[];
	quickSelectWeaponIds?: MainWeaponId[];
	withRightButton?: boolean;
	label?: string;
}) {
	const categories = useWeaponOptions(quickSelectWeaponIds);

	const valueToLabel = (selectedKey: MainWeaponId | null) =>
		categories
			.flatMap((category) => category.options)
			.find((option) => option.id === selectedKey)?.label ?? "";

	const {
		fieldState,
		isOpen,
		onBlur,
		onFocus,
		onInputChange,
		onSelectionChange,
	} = useComboboxState({ valueToLabel, value, onChange });

	const selectedKey = value ?? fieldState.selectedKey;

	const filteredOptions = useWeaponFilter(categories, fieldState.inputValue);

	return (
		<MyComboBox
			id={id}
			name={name}
			label={label}
			isRequired={isRequired}
			aria-label={!label ? "Weapon" : undefined}
			items={filteredOptions}
			selectedKey={selectedKey}
			inputValue={fieldState.inputValue}
			onSelectionChange={onSelectionChange}
			onInputChange={onInputChange}
			isOpen={isOpen}
			onFocus={onFocus}
			onBlur={onBlur}
			rightButtonChildren={
				withRightButton && (
					<Image
						path={
							typeof selectedKey === "number"
								? mainWeaponImageUrl(selectedKey)
								: abilityImageUrl("UNKNOWN")
						}
						size={32}
						alt=""
					/>
				)
			}
		>
			{(section) => (
				<Section id={section.label}>
					<MyComboBoxHeader>
						{section.id !== "QUICK" ? (
							<Image
								path={weaponCategoryUrl(section.id)}
								width={20}
								height={20}
								alt={section.label}
							/>
						) : null}
						{section.label}
					</MyComboBoxHeader>
					<Collection
						items={section.options}
						dependencies={[disabledWeaponIds?.join(",")]}
					>
						{(item) => {
							const isDisabled = disabledWeaponIds?.includes(item.id);

							return (
								<ListBoxItem
									className={({ isFocused, isSelected }) =>
										clsx("my-combobox__weapon__list-box-item", {
											"my-combobox__weapon__list-box-item__focused": isFocused,
											"my-combobox__weapon__list-box-item__selected":
												isSelected,
											"my-combobox__weapon__list-box-item__disabled":
												isDisabled,
										})
									}
									textValue={item.label}
									isDisabled={isDisabled}
								>
									<WeaponImage
										weaponSplId={item.id}
										size={28}
										variant="build"
										className="my-combobox__image"
									/>
									{item.label}
								</ListBoxItem>
							);
						}}
					</Collection>
				</Section>
			)}
		</MyComboBox>
	);
}

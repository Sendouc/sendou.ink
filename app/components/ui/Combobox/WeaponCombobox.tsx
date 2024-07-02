import clsx from "clsx";
import * as React from "react";
import {
	Collection,
	type Key,
	ListBoxItem,
	Section,
} from "react-aria-components";
import { Image, WeaponImage } from "~/components/Image";
import type { MainWeaponId } from "~/modules/in-game-lists";
import {
	abilityImageUrl,
	mainWeaponImageUrl,
	weaponCategoryUrl,
} from "~/utils/urls";
import { MyComboBox, MyComboBoxHeader } from "./MyComboBox";
import { useWeaponFilter } from "./hooks/useWeaponFilter";
import { useWeaponOptions } from "./hooks/useWeaponOptions";

// xxx: extract state logic to another hook
export function WeaponComboBox({
	id,
	value,
	onChange,
	disabledWeaponIds,
	withRightButton = true,
	label,
}: {
	id?: string;
	value?: MainWeaponId | null;
	onChange?: (weaponId: MainWeaponId | null) => void;
	disabledWeaponIds?: MainWeaponId[];
	withRightButton?: boolean;
	label?: string;
}) {
	const categories = useWeaponOptions();

	const selectedKeyToInputValue = (selectedKey: MainWeaponId | null) =>
		categories
			.flatMap((category) => category.options)
			.find((option) => option.id === selectedKey)?.label ?? "";

	const [fieldState, setFieldState] = React.useState<{
		selectedKey: MainWeaponId | null;
		inputValue: string;
	}>({
		selectedKey: null,
		inputValue: typeof value === "number" ? selectedKeyToInputValue(value) : "",
	});
	const [isOpen, setIsOpen] = React.useState(false);

	const selectedKey = value ?? fieldState.selectedKey;

	const filteredOptions = useWeaponFilter(categories, fieldState.inputValue);

	const onSelectionChange = (id: Key | null) => {
		if (id === selectedKey) return;

		const weaponSplId = id as MainWeaponId | null;

		setFieldState({
			inputValue: selectedKeyToInputValue(weaponSplId),
			selectedKey: weaponSplId,
		});
		onChange?.(weaponSplId);
		setIsOpen(false);
	};

	const onInputChange = (value: string) => {
		setIsOpen(true);
		setFieldState((prevState) => ({
			inputValue: value,
			selectedKey: value === "" ? null : prevState.selectedKey,
		}));
		onChange?.(value === "" ? null : selectedKey);
	};

	const onBlur = () => {
		setIsOpen(false);

		if (typeof selectedKey !== "number") return;

		setFieldState({
			inputValue: selectedKeyToInputValue(selectedKey),
			selectedKey,
		});
	};

	return (
		<MyComboBox
			id={id}
			label={label}
			aria-label={!label ? "Weapon" : undefined}
			items={filteredOptions}
			selectedKey={selectedKey}
			inputValue={fieldState.inputValue}
			onSelectionChange={onSelectionChange}
			onInputChange={onInputChange}
			isOpen={isOpen}
			onFocus={() => setIsOpen(true)}
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
						<Image
							path={weaponCategoryUrl(section.id)}
							width={20}
							height={20}
							alt={section.label}
						/>
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

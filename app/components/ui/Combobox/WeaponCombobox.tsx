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

export function WeaponComboBox() {
	const categories = useWeaponOptions();

	const [fieldState, setFieldState] = React.useState<{
		selectedKey: MainWeaponId | null;
		inputValue: string;
	}>({
		selectedKey: null,
		inputValue: "",
	});

	const filteredOptions = useWeaponFilter(categories, fieldState.inputValue);

	const onSelectionChange = (id: Key | null) => {
		const weaponSplId = id as MainWeaponId | null;

		setFieldState({
			inputValue:
				categories
					.flatMap((category) => category.options)
					.find((option) => option.id === id)?.label ?? "",
			selectedKey: weaponSplId,
		});
	};

	const onInputChange = (value: string) => {
		setFieldState((prevState) => ({
			inputValue: value,
			selectedKey: value === "" ? null : prevState.selectedKey,
		}));
	};

	return (
		<MyComboBox
			label="Weapon"
			items={filteredOptions}
			selectedKey={fieldState.selectedKey}
			inputValue={fieldState.inputValue}
			onSelectionChange={onSelectionChange}
			onInputChange={onInputChange}
			rightButtonChildren={
				<Image
					path={
						fieldState.selectedKey
							? mainWeaponImageUrl(fieldState.selectedKey)
							: abilityImageUrl("UNKNOWN")
					}
					size={32}
					alt=""
				/>
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
					<Collection items={section.options}>
						{(item) => (
							<ListBoxItem
								className={({ isFocused, isSelected }) =>
									clsx("my-combobox__weapon__list-box-item", {
										"my-combobox__weapon__list-box-item__focused": isFocused,
										"my-combobox__weapon__list-box-item__selected": isSelected,
									})
								}
								textValue={item.label}
							>
								<WeaponImage
									weaponSplId={item.id}
									size={28}
									variant="build"
									className="my-combobox__image"
								/>
								{item.label}
							</ListBoxItem>
						)}
					</Collection>
				</Section>
			)}
		</MyComboBox>
	);
}

import clsx from "clsx";
import { Collection, ListBoxItem, Section } from "react-aria-components";
import { Image } from "~/components/Image";
import type { GearType } from "~/db/types";
import { abilityImageUrl, brandImageUrl, gearImageUrl } from "~/utils/urls";
import { MyComboBox, MyComboBoxHeader } from "./MyComboBox";
import { useComboboxState } from "./hooks/useComboboxState";
import { useGearFilter } from "./hooks/useGearFilter";
import { useGearOptions } from "./hooks/useGearOptions";

export function GearComboBox({
	id,
	name,
	value,
	onChange,
	slot,
}: {
	id?: string;
	name?: string;
	value?: number | null;
	onChange?: (weaponId: number | null) => void;
	slot: GearType;
}) {
	const categories = useGearOptions(slot);

	// xxx: should be inside the hook?
	const valueToLabel = (selectedKey: number | null) =>
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

	const filteredOptions = useGearFilter(categories, fieldState.inputValue);

	return (
		<MyComboBox
			id={id}
			name={name}
			items={filteredOptions}
			selectedKey={selectedKey ?? ""}
			inputValue={fieldState.inputValue}
			onSelectionChange={onSelectionChange}
			onInputChange={onInputChange}
			isOpen={isOpen}
			onFocus={onFocus}
			onBlur={onBlur}
			rightButtonChildren={
				<Image
					path={
						typeof selectedKey === "number"
							? gearImageUrl(slot, selectedKey)
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
							path={brandImageUrl(section.id)}
							width={20}
							height={20}
							alt={section.label}
						/>
						{section.label}
					</MyComboBoxHeader>
					<Collection items={section.options}>
						{(item) => {
							return (
								<ListBoxItem
									className={({ isFocused, isSelected }) =>
										clsx("my-combobox__weapon__list-box-item", {
											"my-combobox__weapon__list-box-item__focused": isFocused,
											"my-combobox__weapon__list-box-item__selected":
												isSelected,
										})
									}
									textValue={item.label}
								>
									<Image
										path={gearImageUrl(slot, item.id)}
										size={28}
										className="my-combobox__image"
										alt=""
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

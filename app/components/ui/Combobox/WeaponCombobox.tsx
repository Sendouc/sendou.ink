import clsx from "clsx";
import * as React from "react";
import { Collection, ListBoxItem, Section } from "react-aria-components";
import { Image, WeaponImage } from "~/components/Image";
import type { MainWeaponId } from "~/modules/in-game-lists";
import {
	abilityImageUrl,
	mainWeaponImageUrl,
	weaponCategoryUrl,
} from "~/utils/urls";
import { MyComboBox, MyComboBoxHeader } from "./MyComboBox";
import { useWeaponOptions } from "./hooks/useWeaponOptions";

export function WeaponComboBox() {
	const options = useWeaponOptions();
	const [weaponSplId, setWeaponSplId] = React.useState<MainWeaponId | null>(
		null,
	);

	return (
		<MyComboBox
			label="Weapon"
			defaultItems={options}
			selectedKey={weaponSplId}
			onSelectionChange={(val) => setWeaponSplId(val as MainWeaponId)}
			leftButtonChildren={
				<Image
					path={
						weaponSplId
							? mainWeaponImageUrl(weaponSplId)
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
							width={18}
							height={18}
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

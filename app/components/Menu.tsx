import {
	Menu as HeadlessUIMenu,
	MenuButton,
	MenuItem,
	MenuItems,
	Transition,
} from "@headlessui/react";
import clsx from "clsx";
import * as React from "react";

export interface MenuProps {
	button: React.ElementType;
	items: {
		// type: "button"; TODO: type: "link"
		text: string;
		id: string | number;
		icon?: React.ReactNode;
		onClick: () => void;
		disabled?: boolean;
		selected?: boolean;
	}[];
	className?: string;
	scrolling?: boolean;
}

export function Menu({ button, items, className, scrolling }: MenuProps) {
	return (
		<HeadlessUIMenu as="div" className={clsx("menu-container", className)}>
			<MenuButton as={button} />
			<Transition
				as={React.Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<MenuItems
					className={clsx("menu__items-container", {
						"menu-container__scrolling": scrolling,
					})}
				>
					{items.map((item) => {
						return (
							<MenuItem key={item.id} disabled={item.disabled}>
								{({ active }) => (
									<button
										className={clsx("menu__item", {
											menu__item__active: active,
											menu__item__disabled: item.disabled,
											menu__item__selected: item.selected,
										})}
										onClick={item.onClick}
										data-testid={`menu-item-${item.id}`}
										type="button"
									>
										{item.icon ? (
											<span className="menu__item__icon">{item.icon}</span>
										) : null}
										{item.text}
									</button>
								)}
							</MenuItem>
						);
					})}
				</MenuItems>
			</Transition>
		</HeadlessUIMenu>
	);
}

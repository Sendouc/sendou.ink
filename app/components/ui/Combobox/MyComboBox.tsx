import clsx from "clsx";
import type {
	ComboBoxProps,
	// ValidationResult,
} from "react-aria-components";
import {
	Button,
	ComboBox,
	Header,
	Input,
	Label,
	ListBox,
	Popover,
} from "react-aria-components";

interface MyComboBoxProps<T extends object>
	extends Omit<ComboBoxProps<T>, "children"> {
	label?: string;
	// description?: string | null;
	// errorMessage?: string | ((validation: ValidationResult) => string);
	children: React.ReactNode | ((item: T) => React.ReactNode);
	rightButtonChildren?: React.ReactNode;
	isOpen?: boolean;
	items?: T[];
}

export function MyComboBox<T extends object>({
	label,
	rightButtonChildren,
	// description,
	// errorMessage,
	children,
	isOpen,
	...props
}: MyComboBoxProps<T>) {
	const showNoResults = props.items && props.items.length === 0;

	return (
		<ComboBox menuTrigger="focus" {...props}>
			<Label>{label}</Label>
			<div className="my-combobox__container">
				<Input
					className={clsx("my-combobox__input", {
						"my-combobox__input__wide": !rightButtonChildren,
					})}
				/>
				{rightButtonChildren ? (
					<Button className="my-combobox__button">{rightButtonChildren}</Button>
				) : null}
			</div>
			{/* {description && <Text slot="description">{description}</Text>} */}
			{/* <FieldError>{errorMessage}</FieldError> */}
			<Popover className="my-combobox__popover" maxHeight={300}>
				{showNoResults ? (
					<div className="my-combobox__no-results-text">No results found</div>
				) : (
					<ListBox>{children}</ListBox>
				)}
			</Popover>
		</ComboBox>
	);
}

export function MyComboBoxHeader({
	children,
	className,
}: { children: React.ReactNode; className?: string }) {
	return (
		<Header className={clsx("my-combobox__header", className)}>
			{children}
		</Header>
	);
}

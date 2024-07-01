import clsx from "clsx";
import type {
	ComboBoxProps,
	// ValidationResult,
} from "react-aria-components";
import {
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
}

export function MyComboBox<T extends object>({
	label,
	// description,
	// errorMessage,
	children,
	...props
}: MyComboBoxProps<T>) {
	return (
		<ComboBox {...props}>
			<Label>{label}</Label>
			<div className="my-combobox-container">
				<Input />
				{/* <Button>▼</Button> */}
			</div>
			{/* {description && <Text slot="description">{description}</Text>} */}
			{/* <FieldError>{errorMessage}</FieldError> */}
			<Popover className="my-combobox__popover">
				<ListBox>{children}</ListBox>
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

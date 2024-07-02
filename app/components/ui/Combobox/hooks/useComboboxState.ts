import * as React from "react";
import type { Key } from "react-aria-components";

export function useComboboxState<T>({
	valueToLabel,
	value,
	onChange,
}: {
	valueToLabel: (value: T | null) => string;
	value?: T | null;
	onChange?: (value: T | null) => void;
}) {
	const [fieldState, setFieldState] = React.useState<{
		selectedKey: T | null;
		inputValue: string;
	}>({
		selectedKey: null,
		inputValue: value !== undefined ? valueToLabel(value) : "",
	});
	const [isOpen, setIsOpen] = React.useState(false);

	const selectedKey = value ?? fieldState.selectedKey;

	const onSelectionChange = (id: Key | null) => {
		if (id === selectedKey) return;

		const value = id as T | null;

		setFieldState({
			inputValue: valueToLabel(value),
			selectedKey: value,
		});
		onChange?.(value);
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

		if (selectedKey === undefined || selectedKey === null) return;

		setFieldState({
			inputValue: valueToLabel(selectedKey),
			selectedKey,
		});
	};

	const onFocus = () => setIsOpen(true);

	return {
		fieldState,
		isOpen,
		onSelectionChange,
		onInputChange,
		onBlur,
		onFocus,
	};
}

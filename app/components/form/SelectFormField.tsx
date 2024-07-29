import * as React from "react";
import {
	type FieldPath,
	type FieldValues,
	get,
	useFormContext,
} from "react-hook-form";
import { FormMessage } from "~/components/FormMessage";
import { Label } from "~/components/Label";

export function SelectFormField<T extends FieldValues>({
	label,
	name,
	values,
	bottomText,
}: {
	label: string;
	name: FieldPath<T>;
	values: Array<{ value: string; label: string }>;
	bottomText?: string;
}) {
	const methods = useFormContext();
	const id = React.useId();

	const error = get(methods.formState.errors, name);

	return (
		<div>
			<Label htmlFor={id}>{label}</Label>
			<select {...methods.register(name)}>
				{values.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{error && (
				<FormMessage type="error">{error.message as string}</FormMessage>
			)}
			{bottomText && !error ? (
				<FormMessage type="info">{bottomText}</FormMessage>
			) : null}
		</div>
	);
}

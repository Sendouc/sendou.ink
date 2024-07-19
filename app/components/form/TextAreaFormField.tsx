import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { z } from "zod";
import { FormMessage } from "~/components/FormMessage";
import { Label } from "~/components/Label";

// xxx: can the generic be forced?
export function TextAreaFormField<T extends z.ZodTypeAny>({
	label,
	name,
	bottomText,
	maxLength,
}: {
	label: string;
	name: keyof z.infer<T> & string;
	bottomText?: string;
	maxLength: number;
}) {
	const methods = useFormContext();
	const value = useWatch({ name }) ?? "";
	const id = React.useId();

	const error = methods.formState.errors[name];

	return (
		<div>
			<Label
				htmlFor={id}
				valueLimits={{ current: value.length, max: maxLength }}
			>
				{label}
			</Label>
			<textarea id={id} {...methods.register(name)} />
			{error && (
				<FormMessage type="error">{error.message as string}</FormMessage>
			)}
			{bottomText && !error ? (
				<FormMessage type="info">{bottomText}</FormMessage>
			) : null}
		</div>
	);
}

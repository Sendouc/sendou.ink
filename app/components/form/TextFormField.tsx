import * as React from "react";
import { useFormContext } from "react-hook-form";
import type { z } from "zod";
import { FormMessage } from "~/components/FormMessage";
import { Label } from "~/components/Label";

// xxx: can the generic be forced?
export function TextFormField<T extends z.ZodTypeAny>({
	label,
	name,
	bottomText,
}: { label: string; name: keyof z.infer<T> & string; bottomText?: string }) {
	const methods = useFormContext();
	const id = React.useId();

	const error = methods.formState.errors[name];

	return (
		<div>
			<Label htmlFor={id}>{label}</Label>
			<input id={id} {...methods.register(name)} />
			{error && (
				<FormMessage type="error">{error.message as string}</FormMessage>
			)}
			{bottomText && !error ? (
				<FormMessage type="info">{bottomText}</FormMessage>
			) : null}
		</div>
	);
}

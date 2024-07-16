import { Form, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { z } from "zod";
import { FormMessage } from "~/components/FormMessage";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { useMyForm } from "~/hooks/useForm";
import { mySlugify } from "~/utils/urls";
import { falsyToNull } from "~/utils/zod";

import { action } from "../actions/org.$slug.edit.server";
import { loader } from "../loaders/org.$slug.edit.server";
export { loader, action };

const DESCRIPTION_MAX_LENGTH = 1_000;
export const organizationEditSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2)
		.max(32)
		.refine((val) => mySlugify(val).length >= 2, {
			message: "Not enough non-special characters",
		}),
	description: z.preprocess(
		falsyToNull,
		z.string().trim().max(DESCRIPTION_MAX_LENGTH).nullable(),
	),
});

export default function TournamentOrganizationEditPage() {
	const data = useLoaderData<typeof loader>();
	const { register, onSubmit, errors } = useMyForm(organizationEditSchema, {
		name: data.organization.name,
		description: data.organization.description,
	});

	return (
		<Main>
			<Form method="post" className="stack md items-start" onSubmit={onSubmit}>
				<h1 className="text-lg">Editing tournament organization</h1>

				<TextFormField
					label="Name"
					error={errors.name?.message}
					{...register("name")}
				/>

				<TextAreaField
					label="Description"
					error={errors.description?.message}
					maxLength={DESCRIPTION_MAX_LENGTH}
					{...register("description")}
				/>

				<SubmitButton>Submit</SubmitButton>
			</Form>
		</Main>
	);
}

const TextFormField = React.forwardRef(
	(
		{
			label,
			error,
			...rest
		}: React.DetailedHTMLProps<
			React.InputHTMLAttributes<HTMLInputElement>,
			HTMLInputElement
		> & { label: string; error?: string },
		ref: React.Ref<HTMLInputElement>,
	) => {
		const id = React.useId();

		return (
			<div>
				<Label htmlFor={id}>{label}</Label>
				<input id={id} ref={ref} {...rest} />
				{error && <FormMessage type="error">{error}</FormMessage>}
			</div>
		);
	},
);

const TextAreaField = React.forwardRef(
	(
		{
			label,
			error,
			maxLength,
			...rest
		}: React.DetailedHTMLProps<
			React.TextareaHTMLAttributes<HTMLTextAreaElement>,
			HTMLTextAreaElement
		> & { label: string; error?: string; maxLength: number },
		ref: React.Ref<HTMLTextAreaElement>,
	) => {
		const [value, setValue] = React.useState(
			(rest.defaultValue as string) ?? "",
		);
		const id = React.useId();

		return (
			<div>
				<Label
					htmlFor={id}
					valueLimits={{ current: value.length, max: maxLength }}
				>
					{label}
				</Label>
				<textarea
					id={id}
					ref={ref}
					{...rest}
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>
				{error && <FormMessage type="error">{error}</FormMessage>}
			</div>
		);
	},
);

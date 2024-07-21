import { useLoaderData } from "@remix-run/react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";
import { FormMessage } from "~/components/FormMessage";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { Toggle } from "~/components/Toggle";
import { UserSearch } from "~/components/UserSearch";
import { AddFieldButton } from "~/components/form/AddFieldButton";
import { FormFieldset } from "~/components/form/FormFieldset";
import { MyForm } from "~/components/form/MyForm";
import { TextAreaFormField } from "~/components/form/TextAreaFormField";
import { TextArrayFormField } from "~/components/form/TextArrayFormField";
import { TextFormField } from "~/components/form/TextFormField";
import { TOURNAMENT_ORGANIZATION_ROLES } from "~/db/tables";
import { wrapToValueStringArrayWithDefault } from "~/utils/form";
import { mySlugify } from "~/utils/urls";
import { falsyToNull } from "~/utils/zod";

import { action } from "../actions/org.$slug.edit.server";
import { loader } from "../loaders/org.$slug.edit.server";
export { loader, action };

// xxx: translate zod errors?

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
	members: z
		.array(
			z.object({
				userId: z.number().int().positive(),
				role: z.enum(TOURNAMENT_ORGANIZATION_ROLES),
				roleDisplayName: z.preprocess(
					falsyToNull,
					z.string().trim().max(32).nullable(),
				),
			}),
		)
		.max(12)
		.refine(
			(arr) =>
				arr.map((x) => x.userId).length ===
				new Set(arr.map((x) => x.userId)).size,
			{
				message: "Same member listed twice",
			},
		),
	socials: z
		.array(
			z.object({
				value: z.string().trim().url().max(100).optional().or(z.literal("")),
			}),
		)
		.max(10)
		.refine(
			(arr) =>
				arr.map((x) => x.value).length ===
				new Set(arr.map((x) => x.value)).size,
			{
				message: "Duplicate social links",
			},
		),
	series: z
		.array(
			z.object({
				name: z.string().trim().min(1).max(32),
				description: z.preprocess(
					falsyToNull,
					z.string().trim().max(DESCRIPTION_MAX_LENGTH).nullable(),
				),
				showLeaderboard: z.boolean(),
			}),
		)
		.max(10)
		.refine(
			(arr) =>
				arr.map((x) => x.name).length === new Set(arr.map((x) => x.name)).size,
			{
				message: "Duplicate series",
			},
		),
});

type FormFields = z.infer<typeof organizationEditSchema>;

export default function TournamentOrganizationEditPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<Main>
			<MyForm
				title="Editing tournament organization"
				schema={organizationEditSchema}
				defaultValues={{
					name: data.organization.name,
					description: data.organization.description,
					socials: wrapToValueStringArrayWithDefault(data.organization.socials),
					members: data.organization.members.map((member) => ({
						userId: member.id,
						role: member.role,
						roleDisplayName: member.roleDisplayName,
					})),
					series: data.organization.series.map((series) => ({
						name: series.name,
						description: series.description,
						showLeaderboard: Boolean(series.showLeaderboard),
					})),
				}}
			>
				<TextFormField<typeof organizationEditSchema>
					label="Name"
					name="name"
				/>

				<TextAreaFormField<typeof organizationEditSchema>
					label="Description"
					name="description"
					maxLength={DESCRIPTION_MAX_LENGTH}
				/>

				<MembersFormField />

				<TextArrayFormField<typeof organizationEditSchema>
					label="Social links"
					name="socials"
					defaultFieldValue=""
				/>

				<SeriesFormField />
			</MyForm>
		</Main>
	);
}

function MembersFormField() {
	const {
		formState: { errors },
	} = useFormContext<FormFields>();
	const { fields, append, remove } = useFieldArray<FormFields>({
		name: "members",
	});

	const rootError = errors.members?.root;

	return (
		<div>
			<Label>Members</Label>
			<div className="stack md">
				{fields.map((field, i) => {
					return <MemberFieldset key={field.id} idx={i} remove={remove} />;
				})}
				<AddFieldButton
					onClick={() => {
						// @ts-expect-error xxx: what here?
						append({ role: "MEMBER", roleDisplayName: null, userId: null });
					}}
				/>
				{rootError && (
					<FormMessage type="error">{rootError.message as string}</FormMessage>
				)}
			</div>
		</div>
	);
}

// xxx: use components, fieldset to one and formfields to one each
function MemberFieldset({
	idx,
	remove,
}: { idx: number; remove: (idx: number) => void }) {
	const {
		register,
		formState: { errors },
		control,
		clearErrors,
	} = useFormContext<FormFields>();

	const memberErrors = errors.members?.[idx];

	return (
		<FormFieldset
			title={`#${idx + 1}`}
			onRemove={() => {
				remove(idx);
				clearErrors("members");
			}}
		>
			<div>
				<label>User</label>
				<Controller
					control={control}
					name={`members.${idx}.userId` as const}
					render={({ field: { onChange, onBlur, value } }) => (
						// xxx: check what happens when API is slow, blank input?
						// xxx: pass ref so can be focused if missing
						<UserSearch
							onChange={(newUser) => onChange(newUser.id)}
							initialUserId={value}
							onBlur={onBlur}
						/>
					)}
				/>
				{memberErrors?.userId && (
					<FormMessage type="error">{memberErrors.userId.message}</FormMessage>
				)}
			</div>
			<div>
				<label>Role</label>
				<select {...register(`members.${idx}.role` as const)}>
					{TOURNAMENT_ORGANIZATION_ROLES.map((role) => (
						<option key={role} value={role}>
							{role}
						</option>
					))}
				</select>
				{memberErrors?.role && (
					<FormMessage type="error">{memberErrors.role.message}</FormMessage>
				)}
			</div>
			<div>
				<label>Role display name</label>
				<input {...register(`members.${idx}.roleDisplayName` as const)} />
				{memberErrors?.roleDisplayName && (
					<FormMessage type="error">
						{memberErrors.roleDisplayName.message}
					</FormMessage>
				)}
			</div>
		</FormFieldset>
	);
}

function SeriesFormField() {
	const {
		formState: { errors },
	} = useFormContext<FormFields>();
	const { fields, append, remove } = useFieldArray<FormFields>({
		name: "series",
	});

	const rootError = errors.series?.root;

	return (
		<div>
			<Label>Series</Label>
			<div className="stack md">
				{fields.map((field, i) => {
					return <SeriesFieldset key={field.id} idx={i} remove={remove} />;
				})}
				<AddFieldButton
					onClick={() => {
						append({ description: "", name: "", showLeaderboard: false });
					}}
				/>
				{rootError && (
					<FormMessage type="error">{rootError.message as string}</FormMessage>
				)}
			</div>
		</div>
	);
}

function SeriesFieldset({
	idx,
	remove,
}: { idx: number; remove: (idx: number) => void }) {
	const {
		register,
		formState: { errors },
		control,
		clearErrors,
	} = useFormContext<FormFields>();

	const seriesErrors = errors.series?.[idx];

	return (
		<FormFieldset
			title={`#${idx + 1}`}
			onRemove={() => {
				remove(idx);
				clearErrors("series");
			}}
		>
			<div>
				<label>Series name</label>
				<input {...register(`series.${idx}.name` as const)} />
				{seriesErrors?.name && (
					<FormMessage type="error">{seriesErrors.name.message}</FormMessage>
				)}
			</div>

			<TextAreaFormField<FormFields>
				label="Description"
				name={`series.${idx}.description` as const}
				maxLength={DESCRIPTION_MAX_LENGTH}
			/>

			<div>
				<label>Show leaderboard</label>
				<Controller
					control={control}
					name={`series.${idx}.showLeaderboard` as const}
					render={({ field: { onChange, value } }) => (
						<Toggle checked={value} setChecked={onChange} />
					)}
				/>
			</div>
		</FormFieldset>
	);
}

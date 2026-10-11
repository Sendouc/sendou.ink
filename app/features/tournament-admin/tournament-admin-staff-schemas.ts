import * as v from "valibot";
import * as StreamAccountInput from "~/features/live-streams/core/StreamAccountInput";
import { TOURNAMENT_STAFF_ROLES } from "~/features/tournament/tournament-constants";
import { array, fieldset, select, textField, userSearch } from "~/form/fields";
import { superRefine } from "~/utils/schema";

export const adminStreamFormSchema = v.object({
	castAccounts: array({
		label: "labels.castAccounts",
		bottomText: "bottomTexts.castAccounts",
		max: 5,
		field: textField({
			maxLength: 200,
			placeholder: "placeholders.castAccounts",
			validate: {
				func: (value) => StreamAccountInput.parse(value) !== null,
				message: "forms:errors.invalidStreamAccount",
			},
		}),
	}),
});

export const adminStaffFormSchema = v.pipe(
	v.object({
		staff: array({
			bottomText: "bottomTexts.staffRolesInfo",
			max: 50,
			field: fieldset({
				fields: v.object({
					userId: userSearch({ label: "labels.user" }),
					role: select({
						label: "labels.staffRole",
						items: TOURNAMENT_STAFF_ROLES.map((role) => ({
							value: role,
							label: `options.staffRole.${role}` as const,
						})),
					}),
				}),
			}),
		}),
	}),
	superRefine((data, ctx) => {
		const userIds = data.staff.map((staffer) => staffer.userId);
		if (userIds.length !== new Set(userIds).size) {
			ctx.addIssue({
				message: "forms:errors.usersMustBeUnique",
				path: ["staff"],
			});
		}
	}),
);

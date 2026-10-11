import * as v from "valibot";
import { stringConstant, textAreaOptional, textField } from "~/form/fields";
import { normalizeFriendCode } from "~/utils/schema";
import {
	FRIEND_CODE_DIGIT_COUNT,
	FRIEND_CODE_MAX_LENGTH,
	FRIEND_CODE_REGEXP,
	SENDOUQ,
} from "./q-constants";

export const updateGroupNoteSchema = v.object({
	_action: stringConstant("UPDATE_NOTE"),
	value: textAreaOptional({
		label: "labels.note",
		maxLength: SENDOUQ.OWN_PUBLIC_NOTE_MAX_LENGTH,
	}),
});

/**
 * Friend code, dashes inserted as the user types. Also accepts a pasted "SW-" prefix.
 * Pass through `normalizeFriendCode` before storing it.
 */
export const friendCodeField = textField({
	label: "labels.friendCode",
	maxLength: FRIEND_CODE_MAX_LENGTH,
	leftAddon: "SW-",
	placeholder: "placeholders.friendCode",
	inputMode: "numeric",
	transformValue: formatTypedFriendCode,
	regExp: {
		pattern: FRIEND_CODE_REGEXP,
		message: "forms:errors.invalidFriendCode",
	},
});

export const addFriendCodeSchema = v.object({
	_action: stringConstant("ADD_FRIEND_CODE"),
	friendCode: friendCodeField,
});

function formatTypedFriendCode(value: string) {
	return normalizeFriendCode(
		value.replace(/\D/g, "").slice(0, FRIEND_CODE_DIGIT_COUNT),
	);
}

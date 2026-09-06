import * as v from "valibot";
import { describe, expect, test } from "vitest";
import { textField, textFieldOptional } from "./fields";

describe("textField", () => {
	const schema = textField({ validate: "url", maxLength: 150 });

	test.each([
		["https://sendou.ink", true, "https URL"],
		["http://sendou.ink", true, "http URL"],
		["javascript:alert(1)", false, "javascript URL"],
		["JavaScript:alert(1)", false, "javascript URL with mixed case protocol"],
		["data:text/html,<script>alert(1)</script>", false, "data URL"],
		["not a url", false, "not a URL at all"],
	])("%s -> %s (%s)", (input, expected) => {
		expect(v.safeParse(schema, input).success).toBe(expected);
	});
});

describe("textFieldOptional", () => {
	const schema = textFieldOptional({ validate: "url", maxLength: 150 });

	test.each([
		["https://sendou.ink", true, "https URL"],
		["javascript:alert(1)", false, "javascript URL"],
	])("%s -> %s (%s)", (input, expected) => {
		expect(v.safeParse(schema, input).success).toBe(expected);
	});
});

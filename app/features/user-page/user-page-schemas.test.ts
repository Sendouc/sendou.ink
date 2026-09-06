import * as v from "valibot";
import { describe, expect, test } from "vitest";
import { DEFAULT_WIDGETS } from "./core/widgets/portfolio";
import { widgetsEditSchema } from "./user-page-schemas";

describe("widgetsEditSchema", () => {
	test("accepts the default layout saved without changes", () => {
		const result = v.safeParse(widgetsEditSchema(false), {
			widgets: JSON.stringify(DEFAULT_WIDGETS),
		});

		expect(result.success).toBe(true);
	});
});

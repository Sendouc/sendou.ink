import * as v from "valibot";

export const channelsSchema = v.object({
	items: v.optional(
		v.array(
			v.object({
				id: v.string(),
				snippet: v.object({ title: v.pipe(v.string(), v.trim()) }),
			}),
		),
		[],
	),
});

import * as v from "valibot";
import { youtubeFetch } from "./fetch";
import { channelsSchema } from "./schemas";

/** Finds a channel by its `@handle` (without the `@`) or channel id, costing 1 quota unit. */
export async function findChannel(
	query: { handle: string } | { id: string },
): Promise<{ id: string; title: string } | null> {
	const data = await youtubeFetch("channels", {
		part: "snippet",
		...("handle" in query ? { forHandle: query.handle } : { id: query.id }),
	});

	const [channel] = v.parse(channelsSchema, data).items;
	if (!channel) return null;

	return { id: channel.id, title: channel.snippet.title };
}

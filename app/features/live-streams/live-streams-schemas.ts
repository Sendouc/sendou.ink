import * as v from "valibot";
import { STREAM_PLATFORMS } from "./live-streams-constants";

export const streamAccountSchema = v.object({
	platform: v.picklist(STREAM_PLATFORMS),
	account: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
});

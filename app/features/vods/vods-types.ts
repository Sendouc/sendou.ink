import type { z } from "zod";
import type { videoMatchSchema, videoSchema } from "./vods-schemas";

export type VideoBeingAddedPartial = Partial<VideoBeingAdded>;

export type VideoBeingAdded = z.infer<typeof videoSchema>;

export type VideoMatchBeingAdded = z.infer<typeof videoMatchSchema>;

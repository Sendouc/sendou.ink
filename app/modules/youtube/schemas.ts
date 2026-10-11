import * as v from "valibot";
import type { Unpacked } from "~/utils/types";

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

export const searchSchema = v.object({
	nextPageToken: v.optional(v.string()),
	items: v.optional(
		v.array(v.object({ id: v.object({ videoId: v.optional(v.string()) }) })),
		[],
	),
});

const thumbnailSchema = v.optional(v.object({ url: v.string() }));

export const videosSchema = v.object({
	items: v.optional(
		v.array(
			v.object({
				id: v.string(),
				snippet: v.object({
					channelId: v.string(),
					title: v.string(),
					description: v.optional(v.string(), ""),
					liveBroadcastContent: v.string(),
					thumbnails: v.optional(
						v.object({
							medium: thumbnailSchema,
							high: thumbnailSchema,
						}),
						{},
					),
				}),
				liveStreamingDetails: v.optional(
					v.object({
						actualEndTime: v.optional(v.string()),
						concurrentViewers: v.optional(v.string()),
					}),
				),
			}),
		),
		[],
	),
});

export const playlistItemsSchema = v.object({
	items: v.optional(
		v.array(v.object({ contentDetails: v.object({ videoId: v.string() }) })),
		[],
	),
});

export const videosStreamTimesSchema = v.object({
	items: v.optional(
		v.array(
			v.object({
				id: v.string(),
				liveStreamingDetails: v.optional(
					v.object({
						actualStartTime: v.optional(v.string()),
						actualEndTime: v.optional(v.string()),
					}),
				),
				statistics: v.optional(v.object({ viewCount: v.optional(v.string()) })),
			}),
		),
		[],
	),
});

export type RawVideo = Unpacked<v.InferOutput<typeof videosSchema>["items"]>;

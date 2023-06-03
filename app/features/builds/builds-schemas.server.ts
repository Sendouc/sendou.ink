import { z } from "zod";
import { safeJSONParse } from "~/utils/zod";

const buildFilterSchema = z.object({
  ability: z.string(), // xxx: narrow down
  value: z.union([z.number(), z.boolean()]),
  comparison: z.enum(["AT_LEAST", "AT_MOST"]),
});

export const buildFiltersSearchParams = z.preprocess(
  safeJSONParse,
  z.union([z.null(), z.array(buildFilterSchema)])
);

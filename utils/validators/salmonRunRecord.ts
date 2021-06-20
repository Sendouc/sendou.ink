import * as z from "zod";

// https://stackoverflow.com/a/3809435
const urlRegex =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

export const salmonRunRecordSchema = z.object({
  rotationId: z.number(), // check on db level
  goldenEggCount: z.number().min(10).max(300),
  category: z.enum([
    "TOTAL",
    "TOTAL_NO_NIGHT",
    "PRINCESS",
    "NT_NORMAL",
    "HT_NORMAL",
    "LT_NORMAL",
    "NT_RUSH",
    "HT_RUSH",
    "NT_FOG",
    "HT_FOG",
    "LT_FOG",
    "NT_GOLDIE",
    "HT_GOLDIE",
    "NT_GRILLERS",
    "HT_GRILLERS",
    "NT_MOTHERSHIP",
    "HT_MOTHERSHIP",
    "LT_MOTHERSHIP",
    "LT_COHOCK",
  ]),
  userIds: z.array(z.number()),
  links: z
    .string()
    .refine((val) => {
      const lines = linesFromTextareaValue(val);
      if (lines.length === 0 || lines.length > 4) {
        return false;
      }

      return true;
    }, "Include 1-4 links")
    .refine((val) => {
      return linesFromTextareaValue(val).every((link) => urlRegex.test(link));
    }, "One of the links is invalid"),
});

function linesFromTextareaValue(value: string) {
  return value
    .trim()
    .split("\n")
    .filter((val) => val !== "");
}

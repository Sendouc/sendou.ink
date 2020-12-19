import * as z from "zod";

// https://stackoverflow.com/a/3809435
const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

export const salmonRunRecordSchema = z.object({
  rotationId: z.number(), // check on db level
  goldenEggCount: z.number().min(0).max(300),
  category: z.string(), // check on db level
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

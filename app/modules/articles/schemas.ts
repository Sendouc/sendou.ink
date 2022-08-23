import { z } from "zod";

export const articleDataSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  date: z.date(),
});

import matter from "gray-matter";
import fs from "node:fs";
import { z, ZodError } from "zod";

const articleDataSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  date: z.date(),
});

export function articleBySlug(slug: string) {
  try {
    const rawMarkdown = fs.readFileSync(`content/articles/${slug}.md`, "utf8");
    const { content, data } = matter(rawMarkdown);

    const { date, ...restParsed } = articleDataSchema.parse(data);

    return {
      content,
      date,
      dateString: date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      authorLink: authorToLink(restParsed.author),
      ...restParsed,
    };
  } catch (e) {
    if (!(e instanceof Error)) throw e;

    if (e.message.includes("ENOENT") || e instanceof ZodError) {
      return null;
    }

    throw e;
  }
}

function authorToLink(author: string) {
  if (author === "Riczi") return "https://twitter.com/Riczi2k";

  return;
}

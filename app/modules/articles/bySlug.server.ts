import matter from "gray-matter";
import fs from "node:fs";
import { ZodError } from "zod";
import { articleDataSchema } from "./schemas";
import path from "node:path";
import { ARTICLES_FOLDER_PATH } from "./constants";

export function articleBySlug(slug: string) {
  try {
    const rawMarkdown = fs.readFileSync(
      path.join(ARTICLES_FOLDER_PATH, `${slug}.md`),
      "utf8"
    );
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

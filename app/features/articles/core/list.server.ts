import matter from "gray-matter";
import fs from "node:fs";
import path from "node:path";
import type { z } from "zod";
import { ARTICLES_FOLDER_PATH } from "../articles-constants";
import { articleDataSchema } from "../articles-schemas.server";

export async function mostRecentArticles(count: number) {
  const files = await fs.promises.readdir(ARTICLES_FOLDER_PATH);

  const articles: Array<
    z.infer<typeof articleDataSchema> & {
      slug: string;
      dateString: string;
    }
  > = [];
  for (const file of files) {
    const rawMarkdown = fs.readFileSync(
      path.join(ARTICLES_FOLDER_PATH, file),
      "utf8",
    );
    const { data } = matter(rawMarkdown);

    const articleData = articleDataSchema.parse(data);
    articles.push({
      ...articleData,
      slug: file.replace(".md", ""),
      dateString: articleData.date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    });
  }

  return articles
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, count)
    .map(({ date: _date, ...rest }) => rest);
}

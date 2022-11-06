import fs from "fs";
import path from "path";
import prettier from "prettier";

const NO_WRITE_KEY = "--no-write";
const dontWrite = process.argv.includes(NO_WRITE_KEY);

const KNOWN_SUFFIXES = ["_zero", "_one", "_two", "_few", "_many", "_other"];

const REPO_TRANSLATIONS_INFO_URL =
  "https://github.com/Sendouc/sendou.ink#translations";

const MD = {
  inlineCode: (s: string) => `\`${s}\``,
  strong: (s: string) => `**${s}**`,
  h2: (s: string) => `## ${s}`,
  li: (s: string) => `- ${s}`,
};

const otherLanguageTranslationPath = (code?: string, fileName?: string) =>
  path.join(
    ...[__dirname, "..", "public", "locales", code, fileName].filter(
      (val): val is string => !!val
    )
  );

const allOtherLanguages = fs
  .readdirSync(otherLanguageTranslationPath())
  .filter((lang) => lang !== "en");

const missingTranslations: Record<
  string,
  Record<string, Array<string>>
> = Object.fromEntries(allOtherLanguages.map((lang) => [lang, {}]));

const totalTranslationCounts: Record<string, number> = {};

const fileNames: string[] = fs.readdirSync(otherLanguageTranslationPath("en"));

for (const file of fileNames) {
  const englishContent = JSON.parse(
    fs.readFileSync(otherLanguageTranslationPath("en", file), "utf8").trim()
  ) as Record<string, string>;
  const key = file.replace(".json", "");
  const englishContentKeys = getKeysWithoutSuffix(englishContent, "en", file);

  if (file !== "gear.json" && file !== "weapons.json") {
    totalTranslationCounts[key] = englishContentKeys.length;
  }

  for (const lang of allOtherLanguages) {
    try {
      const otherRawContent = fs
        .readFileSync(otherLanguageTranslationPath(lang, file), "utf8")
        .trim();
      let otherLanguageContent: Record<string, string>;
      try {
        otherLanguageContent = JSON.parse(otherRawContent);
      } catch (e) {
        throw new Error(`failed to parse ${lang}/${file}`);
      }

      const otherLanguageContentKeys = getKeysWithoutSuffix(
        otherLanguageContent,
        lang,
        file
      );

      validateNoExtraKeysInOther({
        english: otherLanguageContentKeys,
        other: otherLanguageContentKeys,
        lang,
        file,
      });
      validateVariables({
        english: englishContent,
        other: otherLanguageContent,
        lang,
        file,
      });
      validateNoDuplicateKeys({
        otherRawContent,
        file,
        lang,
      });

      const missingKeys = englishContentKeys.filter(
        (key) => !otherLanguageContentKeys.includes(key)
      );

      if (key === "weapons" || key === "gear") {
        if (missingKeys.length > 0) {
          throw new Error(`missing keys in ${lang}/${file}`);
        }
      } else {
        missingTranslations[lang]![key] = missingKeys;
      }
    } catch (e) {
      if ((e as { code: string }).code !== "ENOENT") throw e;

      missingTranslations[lang]![key] = englishContentKeys;
    }
  }
}

// eslint-disable-next-line no-console
console.log("no issues found inside translation files");

if (dontWrite) {
  process.exit(0);
}

const markdown = createTranslationProgessMarkdown({
  missingTranslations,
  totalTranslationCounts,
});

const formattedMarkdown = prettier.format(markdown, { parser: "markdown" });

const translationProgressPath = path.join(
  __dirname,
  "..",
  "translation-progress.md"
);

fs.writeFileSync(translationProgressPath, formattedMarkdown);

// eslint-disable-next-line no-console
console.log("translation-progress.md written");

function validateNoExtraKeysInOther({
  english,
  other,
  lang,
  file,
}: {
  english: string[];
  other: string[];
  lang: string;
  file: string;
}) {
  const validKeys = english;

  for (const key of other) {
    if (validKeys.includes(key)) continue;

    throw new Error(`unknown key in ${lang}/${file}: ${key}`);
  }
}

function validateVariables({
  english,
  other,
  lang,
  file,
}: {
  english: Record<string, string>;
  other: Record<string, string>;
  lang: string;
  file: string;
}) {
  for (const [key, value] of Object.entries(english)) {
    const otherValue = other[key];
    if (!otherValue) continue;

    const englishMatches = value.match(/{{(.*?)}}/g);
    const otherMatches = otherValue.match(/{{(.*?)}}/g);

    if (!englishMatches && !otherMatches) continue;

    for (const englishVar of englishMatches ?? []) {
      if (!otherMatches?.includes(englishVar)) {
        throw new Error(
          `variable mismatch in ${lang}/${file}: ${englishVar} is missing in ${otherValue}`
        );
      }
    }
  }
}

function validateNoDuplicateKeys({
  otherRawContent,
  lang,
  file,
}: {
  otherRawContent: string;
  lang: string;
  file: string;
}) {
  const keys = new Set<string>();
  const duplicateKeys = new Set<string>();
  for (const line of otherRawContent.split("\n")) {
    const key = line.trim().split(":")[0];
    if (!key) continue;

    if (keys.has(key)) {
      duplicateKeys.add(key);
    }
    keys.add(key);
  }

  if (duplicateKeys.size > 0) {
    throw new Error(
      `duplicate key(s) in ${lang}/${file}: ${Array.from(duplicateKeys).join(
        ", "
      )}`
    );
  }
}

// get keys while respecting different plural/context key suffixes in different languages.
function getKeysWithoutSuffix(
  translations: Record<string, string>,
  lang: string,
  file: string
): string[] {
  const foundSuffixKeys = new Set<string>();
  const keys = [];

  for (const key of Object.keys(translations)) {
    const suffix = KNOWN_SUFFIXES.find((sfx) => key.endsWith(sfx));
    if (!suffix) {
      if (foundSuffixKeys.has(key)) {
        throw new Error(
          `Found same key with and without suffixes in ${lang}/${file}: ${key}`
        );
      }
      keys.push(key);
      continue;
    }

    const baseKey = key.replace(suffix, "");

    if (foundSuffixKeys.has(baseKey)) {
      // Already found this key with a suffix. Duplicates are handled elsewhere.
      continue;
    }

    if (keys.includes(baseKey)) {
      throw new Error(
        `Found same key with and without suffixes in ${lang}/${file}: ${baseKey}`
      );
    }

    keys.push(baseKey);
    foundSuffixKeys.add(baseKey);
  }

  return keys;
}

type StatusProps = {
  totalCount: number;
  missingCount: number;
  percentage?: boolean;
};
function MDCompletionStatus({
  totalCount,
  missingCount,
  percentage,
}: StatusProps) {
  const circle =
    missingCount === 0 ? "🟢" : missingCount === totalCount ? "🔴" : "🟡";

  const nonMissingCount = totalCount - missingCount;

  if (!percentage) {
    return `${circle} ${nonMissingCount}/${totalCount}`;
  }

  const percent =
    totalCount === 0 ? 100 : Math.floor((nonMissingCount / totalCount) * 100);

  return `${circle} ${percent}%`;
}

function MDOverviewTable({
  totalTranslationCounts,
}: {
  totalTranslationCounts: Record<string, number>;
}) {
  const totalKeysCount = Object.values(totalTranslationCounts).reduce(
    (a, b) => a + b,
    0
  );
  const relevantFiles = fileNames.filter(
    (name) => name !== "weapons.json" && name !== "gear.json"
  );

  const rows = [];

  rows.push(
    `| Language | Total | ${relevantFiles.map(MD.inlineCode).join(" | ")} |`
  );

  rows.push(`| :-- | :-: | ${relevantFiles.map(() => ":-:").join(" | ")} |`);

  for (const [lang, missingKeysObj] of Object.entries(missingTranslations)) {
    const cells = [];

    cells.push(MD.strong(lang));

    const totalAmountOfMissingKeys = Object.values(missingKeysObj).reduce(
      (a, b) => a + b.length,
      0
    );

    cells.push(
      MD.strong(
        MDCompletionStatus({
          totalCount: totalKeysCount,
          missingCount: totalAmountOfMissingKeys,
          percentage: true,
        })
      )
    );

    for (const file of relevantFiles) {
      const fileKey = file.replace(".json", "");
      const missingKeysInFile = missingKeysObj[fileKey];
      if (!missingKeysInFile) {
        return "";
      }

      cells.push(
        MDCompletionStatus({
          totalCount: totalTranslationCounts[fileKey]!,
          missingCount: missingKeysInFile.length,
        })
      );
    }

    rows.push(`| ${cells.join(" | ")} |`);
  }

  return rows.join("\n");
}

function MDDetails({ summary, content }: { summary: string; content: string }) {
  return `<details><summary>${summary}</summary>\n\n${content}\n\n</details>`;
}

function MDMissingKeysList({
  missingTranslations,
}: {
  missingTranslations: Record<string, Record<string, Array<string>>>;
}) {
  const blocks = [];

  for (const [lang, missingKeysObj] of Object.entries(missingTranslations)) {
    const totalAmountOfMissingKeys = Object.values(missingKeysObj).reduce(
      (a, b) => a + b.length,
      0
    );

    if (totalAmountOfMissingKeys === 0) {
      continue;
    }

    const parts = [];

    parts.push(MD.h2(lang));

    const filteredEntries = Object.entries(missingKeysObj).filter(
      ([_, missingKeys]) => missingKeys.length > 0
    );

    for (const [fileKey, missingKeys] of filteredEntries) {
      parts.push(
        MDDetails({
          summary: `<code>${fileKey}.json</code>`,
          content:
            missingKeys.length === totalTranslationCounts[fileKey]!
              ? `All keys missing - Create a fresh copy of ${MD.inlineCode(
                  `en/${fileKey}.json`
                )} to get started.`
              : missingKeys.map(MD.li).join("\n"),
        })
      );
    }

    blocks.push(parts.join("\n\n"));
  }

  return blocks.join("\n\n");
}

function createTranslationProgessMarkdown({
  missingTranslations,
  totalTranslationCounts,
}: {
  missingTranslations: Record<string, Record<string, Array<string>>>;
  totalTranslationCounts: Record<string, number>;
}) {
  return `
> 🤖 This issue is fully automated, it should always be up-to-date.

# Translation Progress

If you want to contribute by adding missing translations, make sure to read the [project description](${REPO_TRANSLATIONS_INFO_URL}) on how to do this 💚

## Overview

Key: 🟢 = Done, 🟡 = In progress, 🔴 = Not started

${MDOverviewTable({ totalTranslationCounts })}

## Missing Keys
  
${MDMissingKeysList({ missingTranslations })}`;
}

// 1) create status.json

import fs from "fs";
import path from "path";

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

for (const file of fs.readdirSync(otherLanguageTranslationPath("en"))) {
  const englishContent = JSON.parse(
    fs.readFileSync(otherLanguageTranslationPath("en", file), "utf8").trim()
  ) as Record<string, string>;
  const key = file.replace(".json", "");

  if (file !== "gear.json" && file !== "weapons.json") {
    totalTranslationCounts[key] = Object.keys(englishContent).length;
  }

  for (const lang of allOtherLanguages) {
    try {
      const otherLanguageContent = JSON.parse(
        fs.readFileSync(otherLanguageTranslationPath(lang, file), "utf8").trim()
      ) as Record<string, string>;

      validateNoExtraKeysInOther({
        english: englishContent,
        other: otherLanguageContent,
        lang,
        file,
      });
      validateVariables({
        english: englishContent,
        other: otherLanguageContent,
        lang,
        file,
      });

      const missingKeys = Object.keys(englishContent).filter(
        (key) => !Object.keys(otherLanguageContent).includes(key)
      );

      if (key === "weapons" || key === "gear") {
        if (missingKeys.length > 0) {
          console.error(`missing keys in ${lang}/${file}`);
        }
      } else {
        missingTranslations[lang]![key] = missingKeys;
      }
    } catch (e) {
      if ((e as { code: string }).code !== "ENOENT") throw e;

      missingTranslations[lang]![key] = Object.keys(englishContent);
    }
  }
}

const markdown = createTranslationProgessMarkdown({
  missingTranslations,
  totalTranslationCounts,
});

fs.writeFileSync(
  path.join(__dirname, "..", "translation-progress.md"),
  markdown
);

function validateNoExtraKeysInOther({
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
  const validKeys = Object.keys(english);

  for (const key of Object.keys(other)) {
    if (validKeys.includes(key)) continue;

    console.error(`unknown key in ${lang}/${file}: ${key}`);
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

    // find all matches inside {{}}
    const englishMatches = value.match(/{{(.*?)}}/g);
    const otherMatches = otherValue.match(/{{(.*?)}}/g);

    if (!englishMatches && !otherMatches) continue;

    for (const englishVar of englishMatches ?? []) {
      if (!otherMatches?.includes(englishVar)) {
        console.error(
          `variable mismatch in ${lang}/${file}: ${englishVar} is missing in ${otherValue}`
        );
      }
    }
  }
}

function createTranslationProgessMarkdown({
  missingTranslations,
  totalTranslationCounts,
}: {
  missingTranslations: Record<string, Record<string, Array<string>>>;
  totalTranslationCounts: Record<string, number>;
}) {
  const totalKeysCount = Object.values(totalTranslationCounts).reduce(
    (a, b) => a + b,
    0
  );

  return `# Translation Progress
${Object.entries(missingTranslations)
  .map(([lang, missingKeysObj]) => {
    const totalAmountOfMissingKeys = Object.values(missingKeysObj).reduce(
      (a, b) => a + b.length,
      0
    );
    const status =
      totalAmountOfMissingKeys === 0
        ? "🟢 Done"
        : totalAmountOfMissingKeys === totalKeysCount
        ? "🔴 Not started"
        : "🟡 In progress";

    const headers = () => {
      if (status !== "🟡 In progress") return "";

      return Object.entries(missingKeysObj)
        .map(([file, missingKeys]) => {
          const statusDot =
            missingKeys.length === 0
              ? "🟢"
              : missingKeys.length === totalTranslationCounts[file]!
              ? "🔴"
              : "🟡";

          return `### ${statusDot} ${file}.json
**${
            totalTranslationCounts[file]! - missingKeys.length
          }/${totalTranslationCounts[file]!}**
${
  missingKeys.length === 0 ||
  missingKeys.length === totalTranslationCounts[file]!
    ? ""
    : `<details>
<summary>Missing</summary>

${missingKeys.map((key) => `- ${key}`).join("\n")}

</details>`
}`;
        })
        .join("\n\n");
    };

    return `## /${lang} (${status})

${headers()}`;
  })
  .join("\n\n---\n\n")}`;
}

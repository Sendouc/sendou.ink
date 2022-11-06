import fs from "fs";
import path from "path";
import prettier from "prettier";

const NO_WRITE_KEY = "--no-write";

const KNOWN_SUFFIXES = ["_zero", "_one", "_two", "_few", "_many", "_other"];

const dontWrite = process.argv.includes(NO_WRITE_KEY);

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
if (dontWrite) {
  if (formattedMarkdown !== fs.readFileSync(translationProgressPath, "utf8")) {
    throw new Error("translation-progress.md is out of date");
  }
} else {
  fs.writeFileSync(translationProgressPath, formattedMarkdown);
}

// eslint-disable-next-line no-console
console.log(
  dontWrite ? "translation-progress.md ok" : "translation-progress.md written"
);

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

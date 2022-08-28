import path from "node:path";
import fs from "node:fs";

const LANG_DICTS_PATH = path.join(__dirname, "dicts", "langs");

export async function loadLangDicts() {
  const result: Array<
    [langCode: string, translations: Record<string, string>]
  > = [];

  const files = await fs.promises.readdir(LANG_DICTS_PATH);
  for (const file of files) {
    if (file === ".gitkeep") continue;

    const translations = JSON.parse(
      fs.readFileSync(path.join(LANG_DICTS_PATH, file), "utf8")
    );

    result.push([file.replace(".json", ""), translations]);
  }

  return result;
}

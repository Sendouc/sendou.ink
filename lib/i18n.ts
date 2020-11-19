import { i18n } from "@lingui/core";
import { en } from "make-plural/plurals";

i18n.loadLocaleData("en", { plurals: en });

/**
 * Load messages for requested locale and activate it.
 */
export async function activate(locale: string) {
  const { messages } = await import(`locale/${locale}/messages.js`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}

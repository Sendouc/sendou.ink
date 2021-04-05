import { i18n } from "@lingui/core";
import { en } from "make-plural/plurals";

i18n.loadLocaleData("en", { plurals: en });

/**
 * Load messages for requested locale and activate it.
 */
export async function activateLocale(locale: string) {
  const [{ messages }, { messages: gameMessages }] = await Promise.all([
    import(`locale/${locale}/messages.json`),
    import(`locale/${locale}/game.json`),
  ]);
  i18n.load(locale, { ...messages, ...gameMessages });
  i18n.activate(locale);
}

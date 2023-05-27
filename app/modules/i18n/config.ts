export const DEFAULT_LANGUAGE = "en";

export const languages = [
  {
    code: "da",
    name: "Dansk",
  },
  {
    code: "de",
    name: "Deutsch",
  },
  {
    code: "en",
    name: "English",
  },
  {
    code: "es-ES",
    name: "Español (NoE)",
  },
  {
    code: "es-US",
    name: "Español (NoA)",
  },
  {
    code: "fr",
    name: "Français",
  },
  {
    code: "he",
    name: "עִבְרִית",
  },
  {
    code: "it",
    name: "Italiano",
  },
  {
    code: "ja",
    name: "日本語",
  },
  {
    code: "ko",
    name: "한국어",
  },
  {
    code: "pl",
    name: "Polski",
  },
  {
    code: "nl",
    name: "Nederlands",
  },
  {
    code: "ru",
    name: "Русский",
  },
  {
    code: "zh",
    name: "中文",
  },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

export const config = {
  supportedLngs: languages.map((lang) => lang.code),
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: "common",
  react: { useSuspense: false },
  interpolation: {
    escapeValue: false,
  },
};

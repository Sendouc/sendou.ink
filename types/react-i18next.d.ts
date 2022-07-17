import "react-i18next";

import type common from "../public/locales/en/common.json";
import type faq from "../public/locales/en/faq.json";
import type contributions from "../public/locales/en/contributions.json";

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      faq: typeof faq;
      contributions: typeof contributions;
    };
  }
}

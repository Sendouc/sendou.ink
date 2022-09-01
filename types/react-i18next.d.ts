import "react-i18next";

import type common from "../public/locales/en/common.json";
import type front from "../public/locales/en/front.json";
import type faq from "../public/locales/en/faq.json";
import type contributions from "../public/locales/en/contributions.json";
import type user from "../public/locales/en/user.json";
import type badges from "../public/locales/en/badges.json";
import type calendar from "../public/locales/en/calendar.json";
import type weapons from "../public/locales/en/weapons.json";
import type builds from "../public/locales/en/builds.json";

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      front: typeof front;
      faq: typeof faq;
      contributions: typeof contributions;
      user: typeof user;
      badges: typeof badges;
      calendar: typeof calendar;
      weapons: typeof weapons;
      builds: typeof builds;
    };
  }
}

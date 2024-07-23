import "react-i18next";

import type analyzer from "../public/locales/en/analyzer.json";
import type art from "../public/locales/en/art.json";
import type badges from "../public/locales/en/badges.json";
import type builds from "../public/locales/en/builds.json";
import type calendar from "../public/locales/en/calendar.json";
import type common from "../public/locales/en/common.json";
import type contributions from "../public/locales/en/contributions.json";
import type faq from "../public/locales/en/faq.json";
import type gameMisc from "../public/locales/en/game-misc.json";
import type gear from "../public/locales/en/gear.json";
import type lfg from "../public/locales/en/lfg.json";
import type org from "../public/locales/en/org.json";
import type q from "../public/locales/en/q.json";
import type team from "../public/locales/en/team.json";
import type tournament from "../public/locales/en/tournament.json";
import type user from "../public/locales/en/user.json";
import type vods from "../public/locales/en/vods.json";
import type weapons from "../public/locales/en/weapons.json";

declare module "react-i18next" {
	interface CustomTypeOptions {
		defaultNS: "common";
		resources: {
			common: typeof common;
			faq: typeof faq;
			contributions: typeof contributions;
			user: typeof user;
			badges: typeof badges;
			calendar: typeof calendar;
			weapons: typeof weapons;
			gear: typeof gear;
			builds: typeof builds;
			analyzer: typeof analyzer;
			"game-misc": typeof gameMisc;
			tournament: typeof tournament;
			team: typeof team;
			vods: typeof vods;
			art: typeof art;
			q: typeof q;
			lfg: typeof lfg;
			org: typeof org;
		};
	}
}

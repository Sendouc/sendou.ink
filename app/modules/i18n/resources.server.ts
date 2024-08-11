import analyzer from "../../../locales/en/analyzer.json";
import art from "../../../locales/en/art.json";
import badges from "../../../locales/en/badges.json";
import builds from "../../../locales/en/builds.json";
import calendar from "../../../locales/en/calendar.json";
import common from "../../../locales/en/common.json";
import contributions from "../../../locales/en/contributions.json";
import faq from "../../../locales/en/faq.json";
import gameMisc from "../../../locales/en/game-misc.json";
import gear from "../../../locales/en/gear.json";
import lfg from "../../../locales/en/lfg.json";
import org from "../../../locales/en/org.json";
import q from "../../../locales/en/q.json";
import team from "../../../locales/en/team.json";
import tournament from "../../../locales/en/tournament.json";
import user from "../../../locales/en/user.json";
import vods from "../../../locales/en/vods.json";
import weapons from "../../../locales/en/weapons.json";

export const resources = {
	en: {
		analyzer,
		art,
		badges,
		builds,
		calendar,
		common,
		contributions,
		faq,
		"game-misc": gameMisc,
		gear,
		lfg,
		org,
		q,
		team,
		tournament,
		user,
		vods,
		weapons,
	},
};

export type Namespace = keyof typeof resources.en;

import "dotenv/config";
import invariant from "tiny-invariant";
import { sql } from "~/db/sql";
import type { Badge } from "~/db/types";
import users from "./users.json";

//#region ITZ

//
// IN THE ZONE
//

const KIVER_ID = 139;
const KAJI_ID = 124;
const PLONTRO_ID = 4316;
const GREY_ID = 1108;
const KYO_ID = 705;
const SHAK_ID = 1106;
const BURSTIE_ID = 3326;
const BISCUIT_ID = 1140;
const BRIAN_ID = 4415;
const KRONOS_ID = 518;
const NOCTIS_ID = 805;
const OBITO_ID = 1115;
const ERZA_ID = 1086;
const ICE_ID = 1113;
const ZERO_ID = 4397;
const BRAN_ID = 1067;
const HENRRY_ID = 1096;
const POWER_ID = 4379;
const TOON_ID = 1226;
const JARED_ID = 851;
const ZERRAZ_ID = 1094;
const MIKA_ID = 1093;
const TICTAC_ID = 1100;
const FUZZY_ID = 4993;
const SENDOU_ID = 8;
const DUDE_ID = 1110;
const ALEXAI_ID = 76;
const SORIN_ID = 4365;
const HYPNOS_ID = 716;
const TERA_ID = 1121;
const DOMO_ID = 2240;
const FROG_ID = 1099;
const BLISS_ID = 4377;
const ISABEL_ID = 809;
const MEHDI_ID = 5077;
const JAY_ID = 3104;
const STORM_HERO_ID = 3576;

const FUMIKO_ID = -1;
const PEPAPIG_ID = -1;
const KAUGO_ID = -1;
const BANANA_ID = -1;
const ZEKKEN_ID = -1;
const TAISAN_ID = -1;
const TOX_ID = -1;
const KNOLOOK_ID = -1;

export const IN_THE_ZONE_WINNERS = [
  // 1
  // https://twitter.com/Sendouc/status/962802653926436865
  [FUZZY_ID, GREY_ID, KRONOS_ID, KYO_ID],
  // 2
  // https://twitter.com/Sendouc/status/967887581542256641
  [PEPAPIG_ID, KAJI_ID, KAUGO_ID, BANANA_ID],
  // 3
  // https://twitter.com/Sendouc/status/978017675392806914
  [KAJI_ID, PLONTRO_ID, KAUGO_ID, BANANA_ID],
  // 4
  // https://twitter.com/Sendouc/status/1020761120158732291
  [FUZZY_ID, ICE_ID, GREY_ID, ERZA_ID],
  // 5
  // https://twitter.com/Sendouc/status/1023313353907810304
  [POWER_ID, TOON_ID, KIVER_ID, KYO_ID],
  // 6
  // https://twitter.com/Sendouc/status/1036368676977553408
  [NOCTIS_ID, FUMIKO_ID, FROG_ID, OBITO_ID],
  // 7
  // https://twitter.com/Sendouc/status/1054116673974951936
  [BRIAN_ID, KIVER_ID, KRONOS_ID, PLONTRO_ID],
  // 8
  // https://twitter.com/Sendouc/status/1059208664836460547
  [GREY_ID, KAJI_ID, PLONTRO_ID, KIVER_ID],
  // 9
  // https://twitter.com/Sendouc/status/1071539122387476480
  [GREY_ID, KAJI_ID, PLONTRO_ID, KIVER_ID],
  // 10
  // https://twitter.com/Sendouc/status/1145463235803516928
  [SORIN_ID, ERZA_ID, BRIAN_ID, ZEKKEN_ID],
  // 11
  // https://twitter.com/Sendouc/status/1178053998512881664
  [SENDOU_ID, BRIAN_ID, DUDE_ID, KIVER_ID],
  // 12
  // https://twitter.com/Sendouc/status/1188572963135729664
  [KIVER_ID, ERZA_ID, GREY_ID, ALEXAI_ID],
  // 13
  // https://twitter.com/Sendouc/status/1200900050077069312
  [ZERO_ID, BURSTIE_ID, ZERRAZ_ID, HENRRY_ID],
  // 14
  // https://twitter.com/Sendouc/status/1234239371282407424
  [ICE_ID, ZERO_ID, BRAN_ID, HENRRY_ID],
  // 15
  // https://twitter.com/Sendouc/status/1244031393845428224
  [KIVER_ID, ERZA_ID, GREY_ID, BLISS_ID],
  // 16
  // https://twitter.com/Sendouc/status/1254183830103130114
  [ZERO_ID, BLISS_ID, JARED_ID, DOMO_ID],
  // 17
  // https://twitter.com/Sendouc/status/1267189159585873921
  [KIVER_ID, GREY_ID, ERZA_ID, ALEXAI_ID],
  // 18
  // https://twitter.com/Sendouc/status/1276992445071462401
  [TERA_ID, ZERO_ID, HYPNOS_ID, TAISAN_ID],
  // 19
  // https://twitter.com/Sendouc/status/1287128237001383937
  [ZERRAZ_ID, TOX_ID, MIKA_ID, KNOLOOK_ID],
  // 20
  // https://twitter.com/Sendouc/status/1299815198614794248
  [KYO_ID, SHAK_ID, BURSTIE_ID, BISCUIT_ID],
  // 21
  // https://twitter.com/Sendouc/status/1342966314172895234
  [KYO_ID, BURSTIE_ID, SHAK_ID, BISCUIT_ID],
  // 22
  // https://twitter.com/Sendouc/status/1355663631657086977
  [HYPNOS_ID, KIVER_ID, GREY_ID, OBITO_ID],
  // 23
  // https://twitter.com/Sendouc/status/1363610718382227469
  [BISCUIT_ID, TICTAC_ID, ICE_ID, JARED_ID],
  // 24
  // https://twitter.com/Sendouc/status/1375948326491815937
  [JARED_ID, KYO_ID, ZERRAZ_ID, MIKA_ID],
  // 25
  // https://twitter.com/Sendouc/status/1517993124601241602
  [ISABEL_ID, MEHDI_ID, JAY_ID, STORM_HERO_ID],
];

//#endregion

const badges: Badge[] = sql.prepare(`select * from "Badge"`).all();
for (const [i, itzTournamentWinners] of IN_THE_ZONE_WINNERS.entries()) {
  const number = i + 1;
  const badgeId = badges.find((b) => {
    const codeWeWant = (() => {
      if (number < 10) return "itz_red";
      if (number < 20) return "itz_orange";

      return "itz_blue";
    })();

    return b.code === codeWeWant;
  })?.id;
  invariant(badgeId, "badgeId unknown");

  const winnerIds: string[] = [];
  for (const winnerId of itzTournamentWinners) {
    if (winnerId === -1) continue;
    const discordId = users.find((u) => u.id === winnerId)?.discordId;
    invariant(discordId);

    winnerIds.push(discordId);
  }

  if (number === 1 || number === 10 || number === 20)
    sql.prepare(`delete from "BadgeOwner" where "badgeId" = ?`).run(badgeId);

  for (const discordId of winnerIds) {
    sql
      .prepare(
        `insert into "BadgeOwner" ("badgeId", "userId") values ($badgeId, (SELECT "id" from "User" where "discordId" = $discordId))`
      )
      .run({ badgeId, discordId });
  }
}

// eslint-disable-next-line no-console
console.log("done!");

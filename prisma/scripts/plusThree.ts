import { Prisma } from "@prisma/client";
import prisma from "../client";

const data = `
2/26/2021 14:04:59,+0,https://sendou.ink/u/naga,EU
2/26/2021 14:09:38,+0,https://sendou.ink/u/400325796386045953,EU
2/26/2021 14:14:32,+0,https://sendou.ink/u/619566583970529314,EU
2/26/2021 14:18:13,+0,https://sendou.ink/u/367391033035849729,NA
2/26/2021 14:30:11,+0,https://sendou.ink/u/synsoren,NA
2/26/2021 14:35:32,+0,https://sendou.ink/u/os69,EU
2/26/2021 14:38:15,+0,https://sendou.ink/u/426240863656476714 ,NA
2/26/2021 14:41:26,+0,https://sendou.ink/u/benny,EU
2/26/2021 14:52:43,+0,https://sendou.ink/u/180426935434739713,EU
2/26/2021 14:54:25,+0,https://sendou.ink/u/167406003749519360,NA
2/26/2021 15:12:20,+0,https://sendou.ink/u/274693882221166597,NA
2/26/2021 15:15:35,+0,https://sendou.ink/u/flaber,NA
2/26/2021 15:32:30,+0,https://sendou.ink/u/snipez,EU
2/26/2021 15:37:06,+0,https://sendou.ink/u/randomact ,NA
2/26/2021 15:52:40,+0,https://sendou.ink/u/333766288969302018,NA
2/26/2021 16:01:09,+0,https://sendou.ink/u/havoc,NA
2/26/2021 16:02:16,+0,https://sendou.ink/u/380496021127692298,NA
2/26/2021 16:35:38,+0,https://sendou.ink/u/343250833770676234,NA
2/26/2021 17:27:18,+0,https://sendou.ink/u/319245965498384387,NA
2/26/2021 17:31:20,+0,https://sendou.ink/u/spoon,NA
2/26/2021 17:44:11,+0,https://sendou.ink/u/320613778708365322,NA
2/26/2021 17:50:20,+0,https://sendou.ink/u/478670344333557790,NA
2/26/2021 18:01:34,+0,https://sendou.ink/u/271300357253103616,NA
2/26/2021 18:05:32,+0,https://sendou.ink/u/BANana,NA
2/26/2021 18:06:01,+0,https://sendou.ink/u/395343063498883074,NA
2/26/2021 18:31:26,+0,https://sendou.ink/u/364559511710728205,NA
2/26/2021 19:20:43,+0,https://sendou.ink/u/Rhythm,NA
2/26/2021 19:21:30,+0,https://sendou.ink/u/MrZ7,NA
2/26/2021 19:21:39,+0,https://sendou.ink/u/iskathere,NA
2/26/2021 19:25:26,+0,https://sendou.ink/u/229482539931271178,NA
2/26/2021 19:27:09,+0,https://sendou.ink/u/259526563324755968,NA
2/26/2021 19:40:45,+0,https://sendou.ink/u/699754496745799781,NA
2/26/2021 19:42:39,+0,https://sendou.ink/u/226462670298152960,NA
2/26/2021 19:57:38,+0,https://sendou.ink/u/253266410661347339,NA
2/26/2021 20:42:34,+0,https://sendou.ink/u/338085552437985290,NA
2/26/2021 20:49:19,+0,https://sendou.ink/u/420714470801670145,NA
2/26/2021 21:13:42,+0,https://sendou.ink/u/125302469277384704,NA
2/26/2021 21:13:57,+0,https://sendou.ink/u/462785588194443266,NA
2/26/2021 21:44:27,+0,https://sendou.ink/u/190421914219446272,NA
2/26/2021 22:09:09,+0,https://sendou.ink/u/473153382039814145,EU
2/26/2021 23:52:56,+0,https://sendou.ink/u/462785588194443266,NA
2/27/2021 3:15:58,+0,https://sendou.ink/u/227972957442539530,NA
2/27/2021 3:59:44,+0,https://sendou.ink/u/dynamo,NA
2/27/2021 7:40:54,+0,https://sendou.ink/u/229482539931271178,NA
2/27/2021 16:47:48,+0,https://sendou.ink/u/392780007350730764,NA
2/27/2021 22:38:19,+0,https://sendou.ink/u/Eclipse_Amos,NA
2/27/2021 22:43:56,+0,https://sendou.ink/u/445086598107889684,NA
2/28/2021 2:55:03,+0,https://sendou.ink/u/264591659776344064,NA
2/28/2021 9:26:27,+0,https://sendou.ink/u/334892993389789185,NA
2/28/2021 19:05:01,+0,https://sendou.ink/u/214972552387231744,NA
2/28/2021 23:59:42,Midpoint,https://sendou.ink/u/601332262046531588,EU
3/1/2021 0:03:00,Midpoint,https://sendou.ink/u/GintoX,EU
3/1/2021 0:12:02,Midpoint,https://sendou.ink/u/436528474807730176,EU
3/1/2021 0:12:22,Midpoint,https://sendou.ink/u/vestaspl,NA
3/1/2021 0:14:56,Midpoint,https://sendou.ink/u/tristan,EU
3/1/2021 0:16:44,Midpoint,https://sendou.ink/u/cactus,NA
3/1/2021 0:23:16,Midpoint,https://sendou.ink/u/yeet,NA
3/1/2021 0:24:16,Midpoint,https://sendou.ink/u/358347295865045023,EU
3/1/2021 0:35:17,Midpoint,https://sendou.ink/u/265491280115662858,EU
3/1/2021 0:52:45,Midpoint,https://sendou.ink/u/399314892902891524,EU
3/1/2021 0:56:48,Midpoint,https://sendou.ink/u/350225756082798593,EU
3/1/2021 1:00:25,Midpoint,https://sendou.ink/u/2fresh4you,EU
3/1/2021 1:04:22,Midpoint,https://sendou.ink/u/390265218401566720,EU
3/1/2021 1:28:30,Midpoint,https://sendou.ink/u/497147537526882327,EU
3/1/2021 2:07:00,+0,https://sendou.ink/u/173238005761441802,NA
3/1/2021 8:27:58,Midpoint,https://sendou.ink/u/rocky,EU
3/1/2021 10:56:29,Midpoint,https://sendou.ink/u/305453601474609153,EU
3/1/2021 11:01:00,Midpoint,https://sendou.ink/u/393411373289177098,EU
3/1/2021 13:43:05,Midpoint,https://sendou.ink/u/334209420433162240,EU
,Tooη ಠ_ಠ  ٩(๑❛ᴗ❛๑)۶#0750,https://sendou.ink/u/159037817320636417,EU
,Jolt#1673,https://sendou.ink/u/348303609135366145,NA
,Yugo#1097,https://sendou.ink/u/283610717217619968,EU
,krun#1947,https://sendou.ink/u/531590779160887307,EU
,Luma#0396,https://sendou.ink/u/414781435057274900,EU
,Thømαs#2781,https://sendou.ink/u/394762516221132811,EU
,Glaceonek Hydrowski#3032,https://sendou.ink/u/211476740512546828,EU
,Smile#9030,https://sendou.ink/u/112851777048567808,EU
,Xercess#3056,https://sendou.ink/u/207150814735761408,EU
,Kenshin#2643,https://sendou.ink/u/358597619972440065,EU
,Fyrae#6448,https://sendou.ink/u/199558778381795330,EU
,zeke#5356,https://sendou.ink/u/784695580920119297,NA
,Kura#1708,https://sendou.ink/u/250689440056475648,EU
,Miner#3527,https://sendou.ink/u/211370564219174912,NA
,Wønder(Dario)#3344,https://sendou.ink/u/325650329972637696,EU
,Fusion#1883,https://sendou.ink/u/78615504511574016,NA
,YuSnipe#1314,https://sendou.ink/u/391583460747378701,EU
,ReshY#6999,https://sendou.ink/u/207480800210452481,EU
,k1llerè#5383,https://sendou.ink/u/386015362376007702,NA
,Leon.#9197,https://sendou.ink/u/345881701739921409,EU
,acidit_y,https://sendou.ink/u/441376533077164043,NA
`;

const main = async () => {
  const lines = data.trim().split("\n");

  const users = await prisma.user.findMany({});
  const profiles = await prisma.profile.findMany({ include: { user: true } });

  const getUser = (value: string): Prisma.UserWhereUniqueInput => {
    const parsed = value.trim().replace("https://sendou.ink/u/", "");
    console.log("parsed", parsed);
    const p = profiles.find(
      (profile) =>
        profile.customUrlPath === parsed.toLowerCase() ||
        profile.user.discordId === parsed
    );
    if (!p) {
      const u = users.find((user) => user.discordId === parsed);
      if (!u) throw Error("wtf");
      return { id: u.id };
    }

    return { id: p.userId };
  };

  const plusStatus: Prisma.PlusStatusCreateInput[] = [];

  for (const line of lines) {
    const [_timestamp, _name, link, region] = line.split(",");

    console.log({ _timestamp, _name, link, region });

    plusStatus.push({
      region: region as any,
      membershipTier: 3,
      user: { connect: getUser(link) },
    });
  }

  for (const status of plusStatus) {
    await prisma.plusStatus.upsert({
      where: { userId: status!.user!.connect!.id! },
      create: status,
      update: { membershipTier: status.membershipTier, region: status.region },
    });
  }
};

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

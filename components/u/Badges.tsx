import { Button } from "@chakra-ui/button";
import { useEffect, useMemo, useState } from "react";
import { wonITZCount } from "utils/constants";
import BadgeContainer from "./BadgeContainer";

const regularTournamentWinners: {
  badgeName: string;
  name: string;
  winnerDiscordIds: string;
}[] = [
  {
    badgeName: "zones",
    name: "Dapple SZ Speedladder",
    winnerDiscordIds:
      "393411373289177098,300073469503340546,554124226915860507,417489824589676548,403345464138661888,343375632819814400,726389792237027370,570288931321413653,716227192060641281",
  },
  {
    badgeName: "girls",
    name: "Girls Duo Cup",
    winnerDiscordIds:
      "266716798945067010,277576057912033281,315610730294411264,222416939291639808,266716798945067010,277576057912033281,315610730294411264,222416939291639808",
  },
  {
    badgeName: "pair",
    name: "League Rush (Pair)",
    winnerDiscordIds:
      "453753483427053568,398818695608270849,776911543216111648,393908122525368331",
  },
  {
    badgeName: "quad",
    name: "League Rush (Quad)",
    winnerDiscordIds:
      "105390854063034368,151192098962407424,147036636608331779,260602342309756940,115572122482507782,109804061900992512,169184589200359424",
  },
  {
    badgeName: "lobster",
    name: "Lobster Crossfire",
    winnerDiscordIds:
      "105390854063034368,109804061900992512,151192098962407424,260602342309756940,266716798945067010,244246880442122250,431923570063441922,114889120379043843",
  },
  {
    badgeName: "monday",
    name: "Monday Afterparty",
    winnerDiscordIds:
      "189021480527331328,397097842411569152,274245305363464192,245195310593212417,427319047785545759,186543007850299393,125301875863060480,328641373655924739,274245305363464192,143918846535925761,147036636608331779,260602342309756940,105390854063034368,189125119937871872,516036546370207764,164734950686326784,133616977968103424,323496682920738817,353199183345352704,207150814735761408,273503438124613632,381129695980290050,344096615033995266,265816182374924298,427221050330316814,724313854536056862,161173517163954176,441232639358402560,108951379095072768,160778600834924544,377510502139691018,338470854339854346,182892865695907840,331170488602591242,310359084387794946,331170488602591242,164734950686326784,133616977968103424,353199183345352704,323496682920738817,675752882682724352,403598012888252426,250689440056475648,410342922253500416,164748705713356800,619566583970529314,448493571419537428,250689440056475648,784695580920119297,393411373289177098,350225756082798593,274693882221166597,436528474807730176,108951379095072768,441232639358402560,477555922026102818,412203683024076800,92909500100513792,99931397451419648,81154649993785344,439066642920505344,388778540545474570,379381005989052427,322793789532143618,365669143413915648,239803554569650177,184415457078411265,334452189185572875,177206374260932609,319245965498384387",
  },
  {
    badgeName: "triton",
    name: "Triton-Cup",
    winnerDiscordIds:
      "277760673436401664,317021572470669312,347127232839417856,149504203654430720,207150814735761408,304337232808902668,403962004739588096,381129695980290050,158163424004538369,330044344738381834,526883393485406208,340583035542175744,105390854063034368,151192098962407424,109804061900992512,115572122482507782,377510502139691018,265816182374924298,323496682920738817,182892865695907840,241892796066299905,304337232808902668,406517090938388492,403962004739588096",
  },
  {
    badgeName: "cake",
    name: "Yay's SUPER AWESOME Birthday Bash!",
    winnerDiscordIds:
      "260602342309756940,105390854063034368,97804913941172224,107263003031764992",
  },
];

interface BadgesProps {
  userId: number;
  userDiscordId: string;
  patreonTier: number | null;
  peakXP?: number;
  presentationMode: boolean;
}

const usersBadges = ({
  userId,
  userDiscordId,
  patreonTier,
  peakXP = -1,
  presentationMode,
}: BadgesProps) => {
  const result: { src: string; description: string; count: number }[] = [];

  const [itz1To9, itz10to19, itz20To29] = wonITZCount(userId);

  // PATREON

  if (patreonTier === 2 || presentationMode) {
    result.push({
      src: "patreon.gif",
      description: "Supporter of sendou.ink on Patreon",
      count: 1,
    });
  }

  if ((patreonTier ?? -1) >= 3 || presentationMode) {
    result.push({
      src: "patreonplus.gif",
      description: "Supporter+ of sendou.ink on Patreon",
      count: 1,
    });
  }

  // XP

  if (peakXP >= 3000) {
    result.push({
      src: "xp30.gif",
      description: "Peak X Power of 3000 or better",
      count: 1,
    });
  } else if (peakXP >= 2900) {
    result.push({
      src: "xp29.gif",
      description: "Peak X Power of 2900 or better",
      count: 1,
    });
  } else if (peakXP >= 2800) {
    result.push({
      src: "xp28.gif",
      description: "Peak X Power of 2800 or better",
      count: 1,
    });
  } else if (peakXP >= 2700) {
    result.push({
      src: "xp27.gif",
      description: "Peak X Power of 2700 or better",
      count: 1,
    });
  } else if (peakXP >= 2600) {
    result.push({
      src: "xp26.gif",
      description: "Peak X Power of 2600 or better",
      count: 1,
    });
  }

  if (presentationMode) {
    result.push({
      src: "xp30.gif",
      description: "Peak X Power of 3000 or better",
      count: 1,
    });
    result.push({
      src: "xp29.gif",
      description: "Peak X Power of 2900 or better",
      count: 1,
    });
    result.push({
      src: "xp28.gif",
      description: "Peak X Power of 2800 or better",
      count: 1,
    });
    result.push({
      src: "xp27.gif",
      description: "Peak X Power of 2700 or better",
      count: 1,
    });
    result.push({
      src: "xp26.gif",
      description: "Peak X Power of 2600 or better",
      count: 1,
    });
  }

  // ITZ

  if (itz1To9 > 0 || presentationMode) {
    result.push({
      src: "itz_red.gif",
      description: "Awarded for winning In The Zone 1-9",
      count: presentationMode ? 1 : itz1To9,
    });
  }

  if (itz10to19 > 0 || presentationMode) {
    result.push({
      src: "itz_orange.gif",
      description: "Awarded for winning In The Zone 10-19",
      count: presentationMode ? 1 : itz10to19,
    });
  }

  if (itz20To29 > 0 || presentationMode) {
    result.push({
      src: "itz_blue.gif",
      description: "Awarded for winning In The Zone 20-29",
      count: presentationMode ? 1 : itz20To29,
    });
  }

  // Other tournaments

  for (const tournament of regularTournamentWinners) {
    const count = tournament.winnerDiscordIds
      .split(",")
      .reduce(
        (count, winnersId) => (winnersId === userDiscordId ? count + 1 : count),
        0
      );

    if (count === 0 && !presentationMode) continue;

    result.push({
      src: `${tournament.badgeName}.gif`,
      description: `Awarded for winning ${tournament.name}`,
      count: presentationMode ? 1 : count,
    });
  }

  return result;
};

const Badges = ({
  userId,
  userDiscordId,
  patreonTier,
  peakXP,
  presentationMode = false,
}: {
  userId: number;
  userDiscordId: string;
  patreonTier: number | null;
  peakXP?: number;
  presentationMode?: boolean;
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [imgsLoaded, setImgsLoaded] = useState(false);

  const badges = useMemo(
    () =>
      usersBadges({
        userId,
        userDiscordId,
        patreonTier,
        peakXP,
        presentationMode,
      }),
    [userId, userDiscordId, patreonTier, peakXP, presentationMode]
  );

  useEffect(() => {
    const loadImage = (imageUrl: string) => {
      return new Promise((resolve, reject) => {
        const loadImg = new Image();
        loadImg.src = imageUrl;
        loadImg.onload = () => setTimeout(() => resolve(imageUrl));
        loadImg.onerror = (err) => reject(err);
      });
    };

    Promise.all(badges.map((badge) => loadImage("/badges/" + badge.src)))
      .then(() => setImgsLoaded(true))
      .catch((err) => console.error("Failed to load images", err));
  }, [badges]);

  if (badges.length === 0) return null;

  return (
    <>
      <BadgeContainer
        badges={badges}
        showBadges={imgsLoaded}
        showInfo={showInfo}
      />
      <Button
        my={3}
        mx="auto"
        size="xs"
        display="block"
        variant="ghost"
        onClick={() => setShowInfo(!showInfo)}
      >
        {showInfo ? "Hide info" : "Show info"}
      </Button>
    </>
  );
};

export default Badges;
